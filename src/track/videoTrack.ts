import fs from "fs";
import path from "path";
import { Music } from "../utils/interfaces.js";
import { tmpDirPath, trackDirPath } from "../utils/config.js";
import { Canvas, CanvasRenderingContext2D } from "canvas";
import Ffmpeg from "fluent-ffmpeg";

export class VideoTrack {
  private framerate: number = 30;
  private videoHeight: number = 1080;
  private videoWidth: number = 1920;

  private music: Music;
  private answerTime: number;
  private pauseTime: number;
  private questionTime: number;

  private videoDuration: number;
  private frameCount: number;

  private musicPath: string;
  private musicFileName: string;

  private imagesDir: string;

  private _trackPath: string;
  public get trackPath(): string {
    return this._trackPath;
  }

  constructor(music: Music, answerTime: number, pauseTime: number) {
    this.music = music;
    this.answerTime = answerTime;
    this.pauseTime = pauseTime;

    this.questionTime = music.extractEnd - music.extractStart;

    this.videoDuration = this.questionTime + answerTime + pauseTime;
    this.frameCount = this.videoDuration * this.framerate;

    this.musicPath = music.localPath;
    this.musicFileName = path.basename(this.musicPath, ".mp3");

    this._trackPath = path.join(trackDirPath, `${this.musicFileName}_track.mp4`);

    this.imagesDir = path.join(tmpDirPath, `${this.musicFileName}_images`);
  }

  public static drawBackground(context: CanvasRenderingContext2D) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  }

  public static drawText(context: CanvasRenderingContext2D, text: string, x: number, y: number, color: string) {
    context.font = "100px sans-serif";
    context.fillStyle = color;
    context.textAlign = "center";
    context.fillText(text, x, y);
  }

  public static drawCountdownClock(
    context: CanvasRenderingContext2D,
    thickness: number,
    countdownTime: number,
    countdownDuration: number
  ) {
    const x = context.canvas.width / 2;
    const y = context.canvas.height / 2;

    const radius = 400;

    const startAngle = -Math.PI / 2;
    const endAngle = (countdownTime / countdownDuration) * Math.PI * 2 - Math.PI / 2;

    context.beginPath();
    context.arc(x, y, radius, startAngle, endAngle, true);
    context.lineWidth = thickness;
    context.strokeStyle = "#000000";
    context.stroke();
    context.closePath();
  }

  public static drawCountdownBar(context: CanvasRenderingContext2D, countdownTime: number, countdownDuration: number) {
    const x = context.canvas.width / 2;
    const y = context.canvas.height / 2;

    const width = 1000;
    const height = 50;

    const startX = x - width / 2;
    const startY = y - height / 2;

    const endX = startX + (countdownTime / countdownDuration) * width;

    context.fillStyle = "#000000";
    context.fillRect(startX, startY, endX - startX, height);
  }

  private drawCountdown(context: CanvasRenderingContext2D, actualTime: number, frame: number) {
    VideoTrack.drawCountdownBar(context, actualTime, this.questionTime);

    VideoTrack.drawText(
      context,
      Math.ceil(this.questionTime - actualTime - 1).toFixed(0),
      context.canvas.width / 2,
      context.canvas.height / 2,
      "#000000"
    );
  }

  private drawAnswer(context: CanvasRenderingContext2D, actualTime: number, frame: number, fadeInTime: number) {
    //opacity with cubic bezier curve
    const opacity = actualTime < fadeInTime ? 1 - Math.pow(1 - actualTime / fadeInTime, 3) : 1;

    VideoTrack.drawText(
      context,
      `${this.music.artist} - ${this.music.title}`,
      context.canvas.width / 2,
      context.canvas.height / 2,
      `rgba(0, 0, 0, ${opacity})`
    );
  }

  private drawFrame(context: CanvasRenderingContext2D, frame: number) {
    let actualTime = frame / this.framerate;

    console.log(`Drawing frame ${frame} at ${actualTime.toFixed(2)} seconds...`);

    if (actualTime < this.questionTime) {
      return this.drawCountdown(context, actualTime, frame);
    }
    actualTime -= this.questionTime;

    if (actualTime < this.answerTime) {
      return this.drawAnswer(context, actualTime, frame, 1);
    }
  }

  private renderFrame(frame: number) {
    const canvas = new Canvas(this.videoWidth, this.videoHeight);
    const context = canvas.getContext("2d");

    VideoTrack.drawBackground(context);

    this.drawFrame(context, frame);

    const output = canvas.toBuffer("image/png");
    const paddedNumber = String(frame).padStart(6, "0");
    const imageFileName = `frame-${paddedNumber}.png`;
    fs.writeFileSync(`${this.imagesDir}/${imageFileName}`, output);
  }

  public async createTrack() {
    return new Promise<string>(async (resolve, reject) => {
      if (fs.existsSync(this.imagesDir)) fs.rmSync(this.imagesDir, { recursive: true });

      fs.mkdirSync(this.imagesDir);

      for (let i = 0; i < this.frameCount; i++) {
        this.renderFrame(i);
      }

      // Stitch all frames together with FFmpeg
      Ffmpeg()
        .input(`${this.imagesDir}/frame-%06d.png`)
        .inputOptions([`-framerate ${this.framerate}`])
        .videoCodec("libx264")
        .outputOptions(["-pix_fmt yuv420p"])
        .fps(this.framerate)
        .saveToFile(this.trackPath)
        .on("end", () => resolve(this.trackPath));
    });
  }
}
