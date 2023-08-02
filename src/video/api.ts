import fs from "fs";
import path from "path";
import { Canvas, CanvasRenderingContext2D } from "canvas";
import { Music } from "../utils/interfaces.js";
import { tmpDirPath, trackDirPath } from "../utils/config.js";
import Ffmpeg from "fluent-ffmpeg";

const framerate = 30;

const drawCountdownClock = (
  context: CanvasRenderingContext2D,
  thickness: number,
  countdownTime: number,
  countdownDuration: number
) => {
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
};

const drawBackground = (context: CanvasRenderingContext2D) => {
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
};

const drawText = (context: CanvasRenderingContext2D, text: string, x: number, y: number) => {
  context.font = "100px sans-serif";
  context.fillStyle = "#000000";
  context.textAlign = "center";
  context.fillText(text, x, y);
};

const drawFrame = (context: CanvasRenderingContext2D, frameNumber: number) => {};

export const createTrackVideo = async (music: Music, answerTime: number, pauseTime: number) => {
  return new Promise<string>(async (resolve, reject) => {
    const musicFileName = path.basename(music.localPath, ".mp3");
    const trackPath = path.join(trackDirPath, `${musicFileName}_track.mp4`);

    const imagesDir = path.join(tmpDirPath, `${musicFileName}_images`);
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

    const questionTime = music.extractEnd - music.extractStart;
    const videoDuration = questionTime + answerTime + pauseTime;

    const frameCount = videoDuration * framerate;

    for (let i = 0; i < frameCount; i++) {
      let actualTime = i / framerate;

      console.log(`Rendering frame ${i} at ${actualTime.toFixed(2)} seconds...`);

      const canvas = new Canvas(1980, 1080);
      const context = canvas.getContext("2d");

      drawBackground(context);

      if (actualTime < questionTime) {
        drawCountdownClock(context, 20, actualTime, questionTime);

        const timeLeft = questionTime - actualTime - 1;
        const secondsLeft = Math.ceil(timeLeft);
        drawText(context, String(secondsLeft), context.canvas.width / 2, context.canvas.height / 2);
      }

      const output = canvas.toBuffer("image/png");
      const paddedNumber = String(i).padStart(6, "0");
      const imageFileName = `frame-${paddedNumber}.png`;
      fs.writeFileSync(`${imagesDir}/${imageFileName}`, output);
    }

    // Stitch all frames together with FFmpeg
    Ffmpeg()
      .input(`${imagesDir}/frame-%06d.png`)
      .inputOptions([`-framerate ${framerate}`])
      .videoCodec("libx264")
      .outputOptions(["-pix_fmt yuv420p"])
      .fps(framerate)
      .saveToFile(trackPath)
      .on("end", () => resolve(trackPath));
  });
};
