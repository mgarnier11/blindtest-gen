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
    if (!fs.existsSync(this.imagesDir)) fs.mkdirSync(this.imagesDir);
  }

  public static drawBackground(context: CanvasRenderingContext2D) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  }

  public static drawText(context: CanvasRenderingContext2D, text: string, x: number, y: number) {
    context.font = "100px sans-serif";
    context.fillStyle = "#000000";
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

  private renderFrame(frame: number) {
    let actualTime = frame / this.framerate;

    console.log(`Rendering frame ${frame} at ${actualTime.toFixed(2)} seconds...`);

    const canvas = new Canvas(this.videoWidth, this.videoHeight);
    const context = canvas.getContext("2d");

    VideoTrack.drawBackground(context);

    if (actualTime < this.questionTime) {
      VideoTrack.drawCountdownClock(context, 20, actualTime, this.questionTime);

      VideoTrack.drawText(
        context,
        Math.ceil(this.questionTime - actualTime - 1).toFixed(0),
        context.canvas.width / 2,
        context.canvas.height / 2
      );
    }

    const output = canvas.toBuffer("image/png");
    const paddedNumber = String(frame).padStart(6, "0");
    const imageFileName = `frame-${paddedNumber}.png`;
    fs.writeFileSync(`${this.imagesDir}/${imageFileName}`, output);
  }

  public async createTrack() {
    return new Promise<string>(async (resolve, reject) => {
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
