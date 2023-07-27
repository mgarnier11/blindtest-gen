import fs from "fs";
import readline from "readline";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { fileURLToPath } from "url";
import { searchMusics } from "node-youtube-music";
import ytdl from "ytdl-core";
import { Canvas, CanvasRenderingContext2D, registerFont } from "canvas";
// import { Canvas, CanvasRenderingContext2D, loadImage, registerFont } from "canvas";
// import { stitchFramesToVideo } from "./utils/stitchFramesToVideo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsPath = path.join(__dirname, "../assets");

if (!fs.existsSync("out/tmp")) fs.mkdirSync("out/tmp", { recursive: true });

// Tell fluent-ffmpeg where it can find FFmpeg
ffmpeg.setFfmpegPath(ffmpegStatic!);
ffmpeg.setFfprobePath(ffprobeStatic.path);

registerFont(`${assetsPath}/caveat-medium.ttf`, { family: "Caveat" });

const musics = await searchMusics(`"Rolling in the Deep" - Adele`);

console.log(musics[0], musics[0].artists);

const music = musics[0];

const url = `https://www.youtube.com/watch?v=${music.youtubeId}`;

const download = (url: string, outputPath: string) =>
  new Promise<void>((resolve, reject) => {
    ffmpeg(
      ytdl(url, {
        quality: "highestaudio",
      })
    )
      .audioBitrate(128)
      .save(outputPath)
      .on("end", () => resolve());
  });

const downloadPath = "out/tmp/music.mp3";

console.log("Downloading track...");

await download(url, downloadPath);

console.log("Track downloaded");

const framerate = 60;

const createPauseAudio = (duration: number) =>
  new Promise<string>((resolve, reject) => {
    const filename = `out/tmp/pause-${duration}.mp3`;

    if (fs.existsSync(filename)) {
      console.log(`Pause audio for ${duration} seconds already exists`);

      resolve(filename);
    } else {
      console.log(`Creating pause audio for ${duration} seconds...`);

      ffmpeg()
        .input("anullsrc=channel_layout=stereo:sample_rate=44100")
        .inputFormat("lavfi")
        .inputOptions([`-t ${duration}`])
        .saveToFile(filename)
        .on("end", () => resolve(filename));
    }
  });

const createFadedPart = (i: number, trackPath: string, fadeIn: number, fadeOut: number, duration: number) =>
  new Promise<string>((resolve, reject) => {
    const filename = `out/tmp/music-faded-${i}.mp3`;

    console.log(`Creating faded part ${i}...`);

    ffmpeg()
      .input(trackPath)
      .inputOptions([`-ss ${duration * i}`, `-t ${duration}`])
      .audioFilters([`afade=in:st=0:d=${fadeIn},afade=out:st=${duration - fadeOut}:d=${fadeOut}`])
      .saveToFile(filename)
      .on("end", () => resolve(filename));
  });

const createMusicPart = (
  trackPath: string,
  i: number,
  startDelay: number = 0,
  endDelay: number = 0,
  fadeIn: number = 0,
  fadeOut: number = 0,
  duration: number = 15
) =>
  new Promise<string>(async (resolve, reject) => {
    const fadedPart = await createFadedPart(i, trackPath, fadeIn, fadeOut, duration);

    const filename = `out/tmp/part-${i}.mp3`;

    console.log(`Merging audio for part ${i}...`);

    const merger = ffmpeg();

    if (startDelay > 0) {
      const startPause = await createPauseAudio(startDelay);

      merger.input(startPause);
    }

    merger.input(fadedPart);

    if (endDelay > 0) {
      const endPause = await createPauseAudio(endDelay);

      merger.input(endPause);
    }

    merger.mergeToFile(filename, "out/tmp").on("end", () => resolve(filename));
  });

const drawCountdownClock = (
  context: CanvasRenderingContext2D,
  thickness: number,
  actualFrame: number,
  frameCount: number
) => {
  const x = context.canvas.width / 2;
  const y = context.canvas.height / 2;

  const radius = 400;

  const startAngle = -Math.PI / 2;
  const endAngle = (actualFrame / frameCount) * Math.PI * 2 - Math.PI / 2;

  context.beginPath();
  context.arc(x, y, radius, startAngle, endAngle, true);
  context.lineWidth = thickness;
  context.strokeStyle = "#000000";
  context.stroke();
  context.closePath();
};

const createCountdownVideo = (duration: number) =>
  new Promise<string>(async (resolve, reject) => {
    const frameCount = duration * framerate;

    const dir = `out/tmp/countdown-${duration}`;

    if (fs.existsSync(dir)) {
      console.log(`Video for countdown ${duration} already exists`);

      resolve(`${dir}/video.mp4`);
    } else {
      fs.mkdirSync(dir);

      const filename = `${dir}/video.mp4`;

      for (let i = 0; i < frameCount; i++) {
        const canvas = new Canvas(1920, 1080);
        const context = canvas.getContext("2d");

        const time = i / framerate;

        console.log(`Rendering frame ${i} at ${time.toFixed(2)} seconds...`);

        // Clear the canvas with a white background color. This is required as we are
        // reusing the canvas with every frame
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);

        drawCountdownClock(context, 10, i, frameCount);

        const text = (duration - time).toFixed(0);
        context.font = "100px Caveat";
        context.fillStyle = "#000000";
        context.textAlign = "center";
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        // Store the image in the directory where it can be found by FFmpeg
        const output = canvas.toBuffer("image/png");
        const paddedNumber = String(i).padStart(6, "0");
        fs.writeFileSync(`${dir}/frame-${paddedNumber}.png`, output);
      }

      // Stitch all frames together with FFmpeg
      ffmpeg()
        .input(`${dir}/frame-%06d.png`)
        .inputOptions([`-framerate ${framerate}`])
        .videoCodec("libx264")
        .outputOptions(["-pix_fmt yuv420p"])
        .fps(framerate)
        .saveToFile(`${dir}/video.mp4`)
        .on("end", () => resolve(filename));
    }
  });

const createPauseVideo = (duration: number, text: string = "") =>
  new Promise<string>(async (resolve, reject) => {
    const frameCount = duration * framerate;

    const dir = `out/tmp/pause-${duration}-${text}`;

    if (fs.existsSync(dir)) {
      console.log(`Video for pause ${duration} already exists`);
      resolve(`${dir}/video.mp4`);
    } else {
      fs.mkdirSync(dir);

      const filename = `${dir}/video.mp4`;

      for (let i = 0; i < frameCount; i++) {
        const canvas = new Canvas(1920, 1080);
        const context = canvas.getContext("2d");

        const time = i / framerate;

        console.log(`Rendering frame ${i} at ${time.toFixed(2)} seconds...`);

        // Clear the canvas with a white background color. This is required as we are
        // reusing the canvas with every frame
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = "100px Caveat";
        context.fillStyle = "#000000";
        context.textAlign = "center";
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        // Store the image in the directory where it can be found by FFmpeg
        const output = canvas.toBuffer("image/png");
        const paddedNumber = String(i).padStart(6, "0");
        fs.writeFileSync(`${dir}/frame-${paddedNumber}.png`, output);
      }

      // Stitch all frames together with FFmpeg
      ffmpeg()
        .input(`${dir}/frame-%06d.png`)
        .inputOptions([`-framerate ${framerate}`])
        .videoCodec("libx264")
        .outputOptions(["-pix_fmt yuv420p"])
        .fps(framerate)
        .saveToFile(`${dir}/video.mp4`)
        .on("end", () => resolve(filename));
    }
  });

const createVideoPart = (duration: number, startDelay: number = 0, endDelay: number = 0) =>
  new Promise<string>(async (resolve, reject) => {
    const countdown = await createCountdownVideo(duration);

    const filename = `out/tmp/part-${duration}.mp4`;

    console.log(`Merging video for part ${duration}...`);

    const merger = ffmpeg();

    if (startDelay > 0) {
      const startPause = await createPauseVideo(startDelay, "StartDelay");

      merger.input(startPause);
    }

    merger.input(countdown);

    if (endDelay > 0) {
      const endPause = await createPauseVideo(endDelay, "EndDelay");

      merger.input(endPause);
    }

    merger.mergeToFile(filename, "out/tmp").on("end", () => resolve(filename));
  });

const mergeAudioVideo = (audioPath: string, videoPath: string, outputPath: string) =>
  new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(audioPath)
      .input(videoPath)
      .saveToFile(outputPath)
      .on("end", () => resolve());
  });

const parts = [];

const partDuration = 20;
const startPause = 0;
const endPause = 5;
const fading = 0;

for (let i = 0; i < 3; i++) {
  console.log(`Creating part ${i}...`);

  const musicPath = await createMusicPart(downloadPath, i, startPause, endPause, fading, fading, partDuration);

  console.log(`Creating video for part ${i}...`);

  const videoPath = await createVideoPart(partDuration, startPause, endPause);

  console.log(`Merging audio and video for part ${i}...`);

  const videoPartPath = `out/tmp/part-${i}.mp4`;

  await mergeAudioVideo(musicPath, videoPath, videoPartPath);

  parts.push(videoPartPath);
}

console.log("Merging parts...");

const merger = ffmpeg();

for (const part of parts) {
  merger.input(part);
}

merger.mergeToFile("out/video.mp4", "out/tmp").on("end", () => console.log("Done!"));

// // Render each frame
// for (let i = 0; i < frameCount; i++) {
//   const canvas = new Canvas(1920, 1080);
//   const context = canvas.getContext("2d");

//   const time = i / framerate;

//   console.log(`Rendering frame ${i} at ${time.toFixed(2)} seconds...`);

//   // Clear the canvas with a white background color. This is required as we are
//   // reusing the canvas with every frame
//   // context.fillStyle = "#ffffff";
//   // context.fillRect(0, 0, canvas.width, canvas.height);

//   renderFrame(context, duration, time);

//   // Store the image in the directory where it can be found by FFmpeg
//   const output = canvas.toBuffer("image/png");
//   const paddedNumber = String(i).padStart(6, "0");
//   await fs.promises.writeFile(`out/tmp/frame-${paddedNumber}.png`, output);
// }

// // Stitch all frames together with FFmpeg
// ffmpeg()
//   .input("out/tmp/frame-%06d.png")
//   .inputOptions([`-framerate ${framerate}`])
//   .videoCodec("libx264")
//   .outputOptions(["-pix_fmt yuv420p"])
//   .fps(framerate)
//   .saveToFile("out/video.mp4");

// function renderFrame(context: CanvasRenderingContext2D, duration: number, time: number) {
//   // Calculate the progress of the animation from 0 to 1
//   let t = time / duration;

//   const text = time.toFixed(0);

//   const x = context.canvas.width / 2;
//   const y = context.canvas.height / 2;

//   context.font = "100px Caveat";
//   context.fillStyle = "#FFFFFF";
//   context.textAlign = "center";
//   const textMetrics = context.measureText(text);
//   const fontHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

//   // context.beginPath();

//   // context.rect(x, y - textMetrics.actualBoundingBoxAscent, textMetrics.width, fontHeight);
//   // context.clip();

//   context.fillText(text, x, y);
// }

//// Music
// const musics = await searchMusics(`"Rolling in the Deep" - Adele`);

// console.log(musics[0], musics[0].artists);

// const music = musics[0];

// const url = `https://www.youtube.com/watch?v=${music.youtubeId}`;

// const url2 = "https://www.youtube.com/watch?v=GNmv0A7Uma4";

// const download = (url: string, outputPath: string) =>
//   new Promise<void>((resolve, reject) => {
//     ffmpeg(
//       ytdl(url, {
//         quality: "highestaudio",
//       })
//     )
//       .audioBitrate(128)
//       .save(outputPath)
//       .on("end", () => resolve());
//   });

// const downloadPath = "out/test.mp3";

// await download(url, downloadPath);

// const createFilePart = (i: number) =>
//   new Promise<void>((resolve, reject) => {
//     ffmpeg()
//       .input(downloadPath)
//       .inputOptions([`-ss ${10 * i}`, "-t 10"])
//       .audioFilters([`afade=in:st=0:d=3,afade=out:st=7:d=3`, `adelay=2000|2000`])
//       .saveToFile(`out/music-${i}.mp3`)
//       .on("end", () => resolve());
//   });

// for (let i = 0; i < 10; i++) {
//   await createFilePart(i);
// }

// ffmpeg()
//   .input("out/music-0.mp3")
//   .input("out/music-1.mp3")
//   .input("out/music-2.mp3")
//   .input("out/music-3.mp3")
//   .input("out/music-4.mp3")
//   .input("out/music-5.mp3")
//   .input("out/music-6.mp3")
//   .input("out/music-7.mp3")
//   .input("out/music-8.mp3")
//   .input("out/music-9.mp3")

//   .mergeToFile("out/music-test.mp3", "out/tmp");

// // Clean up the temporary directories first
// for (const path of ["out", "tmp/output"]) {
//   if (fs.existsSync(path)) {
//     await fs.promises.rm(path, { recursive: true });
//   }
//   await fs.promises.mkdir(path, { recursive: true });
// }

// const canvas = new Canvas(1280, 720);
// const context = canvas.getContext("2d");

// const logo = await loadImage("assets/logo.svg");

// // The video length and frame rate, as well as the number of frames required
// // to create the video
// const duration = 3;
// const frameRate = 60;
// const frameCount = Math.floor(duration * frameRate);

// // Render each frame
// for (let i = 0; i < frameCount; i++) {
//   const time = i / frameRate;

//   console.log(`Rendering frame ${i} at ${Math.round(time * 10) / 10} seconds...`);

//   // Clear the canvas with a white background color. This is required as we are
//   // reusing the canvas with every frame
//   context.fillStyle = "#ffffff";
//   context.fillRect(0, 0, canvas.width, canvas.height);

//   renderFrame(context, duration, time);

//   // Store the image in the directory where it can be found by FFmpeg
//   const output = canvas.toBuffer("image/png");
//   const paddedNumber = String(i).padStart(4, "0");
//   await fs.promises.writeFile(`tmp/output/frame-${paddedNumber}.png`, output);
// }

// // Stitch all frames together with FFmpeg
// await stitchFramesToVideo(
//   "tmp/output/frame-%04d.png",
//   "assets/catch-up-loop-119712.mp3",
//   "out/video.mp4",
//   duration,
//   frameRate
// );

// function renderFrame(context: CanvasRenderingContext2D, duration: number, time: number) {
//   // Calculate the progress of the animation from 0 to 1
//   let t = time / duration;

//   // Draw the image from left to right over a distance of 550 pixels
//   context.drawImage(logo, 100 + t * 550, 100, 500, 500);
// }
