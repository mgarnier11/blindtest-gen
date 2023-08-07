import fs from "fs";
import readline from "readline";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import path from "path";
import { fileURLToPath } from "url";
import { searchMusics } from "node-youtube-music";
import ytdl from "ytdl-core";
import { Canvas, CanvasRenderingContext2D, registerFont } from "canvas";
import { downloadMusicRequests } from "./deezer/downloader.js";
import { MusicRequest } from "./utils/interfaces.js";
import { Track } from "./track/track.js";
import { Text } from "./track/components/text.js";
import { outDirPath, tmpDirPath } from "./utils/config.js";
import { Transition, TransitionType } from "./track/effects/transition.js";
import { ProgressBar } from "./track/components/progressBar.js";
import Ffmpeg from "fluent-ffmpeg";
import { Switch } from "./track/effects/switch.js";
import { Rectangle } from "./track/components/rectangle.js";
import { Effects } from "./track/effects/effects.js";
import { registerEffects } from "./track/effects/effect.js";
await registerEffects();

import { registerComponents } from "./track/components/component.js";
await registerComponents();
import { Set } from "./track/effects/set.js";
import { RectangleBorder } from "./track/components/rectangleBorder.js";
import { Component } from "./track/components/component.js";

// const text = new Text(
//   { x: -100, y: 400 },
//   [
//     new Transition("position.x", 300, 15, 30),
//     new Transition("position.x", 100, 30, 45),
//     new Transition("position.y", 800, 0, 60),
//     new Transition("position.y", 600, 60, 75),
//     new Transition("color.h", 360, 0, 75),
//   ],
//   {
//     type: "hsla",
//     h: 0,
//     s: 100,
//     l: 50,
//   }
// );

if (fs.existsSync(tmpDirPath)) fs.rmSync(tmpDirPath, { recursive: true, force: true });
fs.mkdirSync(tmpDirPath, { recursive: true });

const videoWidth = 1920;
const videoHeight = 1080;
const framerate = 30;
const countdownDuration = 5;
const videoDuration = 7;

const countdownFrames = countdownDuration * framerate;

const countdownText = new Text.Builder()
  .withPosition({ x: videoWidth / 2, y: videoHeight / 2 - 50 })
  .withColor("white")
  .withFontSettings({ family: "Arial", size: 20 })
  .withTextAlign("center")
  .withEffects([
    new Set.Builder().withProperty("opacity").withFrameToSet(0).withValue(0).build(),
    ...Effects.Fade(0, framerate, "in"),
    ...Effects.Fade(framerate * 2, framerate * 3, "out"),
    ...Effects.Fade(framerate * 4, framerate * 5, "in"),
    ...Effects.Fade(framerate * 6, framerate * 7, "out"),
  ])
  .build();

const bar = new ProgressBar.Builder()
  .withPosition({ x: videoWidth / 2 - 500 / 2, y: videoHeight / 2 - 50 / 2 })
  .withSize({ width: 500, height: 50 })
  .withStartFrame(0)
  .withEndFrame(countdownFrames)
  .withColor("white")
  .withProgressSettings({ offset: { width: 7, height: 7 }, corners: 3 })
  .withBorderSettings({ color: "white", width: 6, corners: 7 })
  .withTransitionType(TransitionType.EASE_IN_OUT)
  .build(framerate);

const countdownTextJSON = countdownText.toJSON();
const barJSON = bar.toJSON();

const str = JSON.stringify({ countdownTextJSON, barJSON });

const countdownText2 = Text.fromJSON(countdownTextJSON);
const bar2 = ProgressBar.fromJSON(barJSON);

const countdownText2JSON = countdownText2.toJSON();
const bar2JSON = bar2.toJSON();

const str2 = JSON.stringify({ countdownTextJSON: countdownText2JSON, barJSON: bar2JSON });

const equal = str === str2;

for (let frame = 1; frame <= framerate * videoDuration; frame++) {
  const canvas = new Canvas(1920, 1080);
  const context = canvas.getContext("2d");

  context.fillStyle = "#000000";
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  bar.draw(context, frame);
  countdownText.draw(context, frame, `${(countdownDuration - frame / framerate).toFixed(0)}`);

  const output = canvas.toBuffer("image/png");
  const paddedNumber = String(frame).padStart(6, "0");
  const imageFileName = `frame-${paddedNumber}.png`;
  fs.writeFileSync(`${tmpDirPath}/${imageFileName}`, output);

  console.log(`Rendered frame ${frame}`);
}

Ffmpeg.setFfmpegPath(ffmpegStatic!);
Ffmpeg.setFfprobePath(ffprobeStatic.path);

Ffmpeg()
  .input(`${tmpDirPath}/frame-%06d.png`)
  .inputOptions([`-framerate ${framerate}`])
  .videoCodec("libx264")
  .outputOptions(["-pix_fmt yuv420p"])
  .fps(framerate)
  .saveToFile(`${outDirPath}/test.mp4`)
  .on("end", () => console.log("done"));

// import { Canvas, CanvasRenderingContext2D, loadImage, registerFont } from "canvas";
// import { stitchFramesToVideo } from "./utils/stitchFramesToVideo.js";

// https://www.youtube.com/watch?v=3CtMFfm78Vw&ab_channel=Noctal

////FROM HERE
// const assetsPath = path.join(process.cwd(), "assets");

// if (!fs.existsSync("out/tmp")) fs.mkdirSync("out/tmp", { recursive: true });

// // Tell fluent-ffmpeg where it can find FFmpeg
// ffmpeg.setFfmpegPath(ffmpegStatic!);
// ffmpeg.setFfprobePath(ffprobeStatic.path);

// registerFont(`${assetsPath}/caveat-medium.ttf`, { family: "Caveat" });
// const requests: MusicRequest[] = [
//   {
//     title: "Bohemian Rhapsody",
//     artist: "Queen",
//     timestamp_start: 102,
//     timestamp_end: 103,
//   },
//   // {
//   //   title: "Imagine",
//   //   artist: "John Lennon",
//   //   timestamp_start: 60,
//   //   timestamp_end: 80,
//   // },
//   // {
//   //   title: "Hotel California",
//   //   artist: "The Eagles",
//   //   timestamp_start: 130,
//   //   timestamp_end: 150,
//   // },
//   // {
//   //   title: "Like a Rolling Stone",
//   //   artist: "Bob Dylan",
//   //   timestamp_start: 45,
//   //   timestamp_end: 65,
//   // },
//   // {
//   //   title: "Billie Jean",
//   //   artist: "Michael Jackson",
//   //   timestamp_start: 68,
//   //   timestamp_end: 88,
//   // },
//   // {
//   //   title: "Wonderwall",
//   //   artist: "Oasis",
//   //   timestamp_start: 90,
//   //   timestamp_end: 110,
//   // },
//   // {
//   //   title: "Sweet Child O' Mine",
//   //   artist: "Guns N' Roses",
//   //   timestamp_start: 105,
//   //   timestamp_end: 125,
//   // },
//   // {
//   //   title: "Thriller",
//   //   artist: "Michael Jackson",
//   //   timestamp_start: 78,
//   //   timestamp_end: 98,
//   // },
//   // {
//   //   title: "Hey Jude",
//   //   artist: "The Beatles",
//   //   timestamp_start: 125,
//   //   timestamp_end: 145,
//   // },
//   // {
//   //   title: "Smells Like Teen Spirit",
//   //   artist: "Nirvana",
//   //   timestamp_start: 60,
//   //   timestamp_end: 80,
//   // },
//   // {
//   //   title: "Rolling in the Deep",
//   //   artist: "Adele",
//   //   timestamp_start: 58,
//   //   timestamp_end: 78,
//   // },
//   // {
//   //   title: "Stairway to Heaven",
//   //   artist: "Led Zeppelin",
//   //   timestamp_start: 120,
//   //   timestamp_end: 140,
//   // },
//   // {
//   //   title: "Bad Guy",
//   //   artist: "Billie Eilish",
//   //   timestamp_start: 75,
//   //   timestamp_end: 95,
//   // },
//   // {
//   //   title: "Shape of You",
//   //   artist: "Ed Sheeran",
//   //   timestamp_start: 60,
//   //   timestamp_end: 80,
//   // },
//   // {
//   //   title: "Viva la Vida",
//   //   artist: "Coldplay",
//   //   timestamp_start: 80,
//   //   timestamp_end: 100,
//   // },
//   // {
//   //   title: "Livin' on a Prayer",
//   //   artist: "Bon Jovi",
//   //   timestamp_start: 85,
//   //   timestamp_end: 105,
//   // },
//   // {
//   //   title: "I Will Always Love You",
//   //   artist: "Whitney Houston",
//   //   timestamp_start: 110,
//   //   timestamp_end: 130,
//   // },
//   // {
//   //   title: "Uptown Funk",
//   //   artist: "Mark Ronson feat. Bruno Mars",
//   //   timestamp_start: 95,
//   //   timestamp_end: 115,
//   // },
//   // {
//   //   title: "Poker Face",
//   //   artist: "Lady Gaga",
//   //   timestamp_start: 50,
//   //   timestamp_end: 70,
//   // },
//   // {
//   //   title: "I Want to Hold Your Hand",
//   //   artist: "The Beatles",
//   //   timestamp_start: 45,
//   //   timestamp_end: 65,
//   // },
// ];
// const musics = await downloadMusicRequests(requests);

// const fadeStart = 3;
// const fadeEnd = 5;
// const questionTime = 15;
// const answerTime = 5;

// const tracks: Track[] = [];

// for (const music of musics) {
//   const track = new Track(music, answerTime, 1, fadeStart, fadeEnd);

//   await track.createTrack();

//   tracks.push(track);
// }
/// TO HERE

//// FROM HERE
// const createCountdownVideo = (duration: number) =>
//   new Promise<string>(async (resolve, reject) => {
//     const frameCount = duration * framerate;

//     const dir = `out/tmp/countdown-${duration}`;

//     if (fs.existsSync(dir)) {
//       console.log(`Video for countdown ${duration} already exists`);

//       resolve(`${dir}/video.mp4`);
//     } else {
//       fs.mkdirSync(dir);

//       const filename = `${dir}/video.mp4`;

//       for (let i = 0; i < frameCount; i++) {
//         const canvas = new Canvas(1920, 1080);
//         const context = canvas.getContext("2d");

//         const time = i / framerate;

//         console.log(`Rendering frame ${i} at ${time.toFixed(2)} seconds...`);

//         // Clear the canvas with a white background color. This is required as we are
//         // reusing the canvas with every frame
//         context.fillStyle = "#ffffff";
//         context.fillRect(0, 0, canvas.width, canvas.height);

//         drawCountdownClock(context, 10, i, frameCount);

//         const text = (duration - time).toFixed(0);
//         context.font = "100px Caveat";
//         context.fillStyle = "#000000";
//         context.textAlign = "center";
//         context.fillText(text, canvas.width / 2, canvas.height / 2);

//         // Store the image in the directory where it can be found by FFmpeg
//         const output = canvas.toBuffer("image/png");
//         const paddedNumber = String(i).padStart(6, "0");
//         fs.writeFileSync(`${dir}/frame-${paddedNumber}.png`, output);
//       }

//       // Stitch all frames together with FFmpeg
//       ffmpeg()
//         .input(`${dir}/frame-%06d.png`)
//         .inputOptions([`-framerate ${framerate}`])
//         .videoCodec("libx264")
//         .outputOptions(["-pix_fmt yuv420p"])
//         .fps(framerate)
//         .saveToFile(`${dir}/video.mp4`)
//         .on("end", () => resolve(filename));
//     }
//   });

// const createPauseVideo = (duration: number, text: string = "") =>
//   new Promise<string>(async (resolve, reject) => {
//     const frameCount = duration * framerate;

//     const dir = `out/tmp/pause-${duration}-${text}`;

//     if (fs.existsSync(dir)) {
//       console.log(`Video for pause ${duration} already exists`);
//       resolve(`${dir}/video.mp4`);
//     } else {
//       fs.mkdirSync(dir);

//       const filename = `${dir}/video.mp4`;

//       for (let i = 0; i < frameCount; i++) {
//         const canvas = new Canvas(1920, 1080);
//         const context = canvas.getContext("2d");

//         const time = i / framerate;

//         console.log(`Rendering frame ${i} at ${time.toFixed(2)} seconds...`);

//         // Clear the canvas with a white background color. This is required as we are
//         // reusing the canvas with every frame
//         context.fillStyle = "#ffffff";
//         context.fillRect(0, 0, canvas.width, canvas.height);

//         context.font = "100px Caveat";
//         context.fillStyle = "#000000";
//         context.textAlign = "center";
//         context.fillText(text, canvas.width / 2, canvas.height / 2);

//         // Store the image in the directory where it can be found by FFmpeg
//         const output = canvas.toBuffer("image/png");
//         const paddedNumber = String(i).padStart(6, "0");
//         fs.writeFileSync(`${dir}/frame-${paddedNumber}.png`, output);
//       }

//       // Stitch all frames together with FFmpeg
//       ffmpeg()
//         .input(`${dir}/frame-%06d.png`)
//         .inputOptions([`-framerate ${framerate}`])
//         .videoCodec("libx264")
//         .outputOptions(["-pix_fmt yuv420p"])
//         .fps(framerate)
//         .saveToFile(`${dir}/video.mp4`)
//         .on("end", () => resolve(filename));
//     }
//   });

// const createVideoPart = (duration: number, startDelay: number = 0, endDelay: number = 0) =>
//   new Promise<string>(async (resolve, reject) => {
//     const countdown = await createCountdownVideo(duration);

//     const filename = `out/tmp/part-${duration}.mp4`;

//     console.log(`Merging video for part ${duration}...`);

//     const merger = ffmpeg();

//     if (startDelay > 0) {
//       const startPause = await createPauseVideo(startDelay, "StartDelay");

//       merger.input(startPause);
//     }

//     merger.input(countdown);

//     if (endDelay > 0) {
//       const endPause = await createPauseVideo(endDelay, "EndDelay");

//       merger.input(endPause);
//     }

//     merger.mergeToFile(filename, "out/tmp").on("end", () => resolve(filename));
//   });

// const mergeAudioVideo = (audioPath: string, videoPath: string, outputPath: string) =>
//   new Promise<void>((resolve, reject) => {
//     ffmpeg()
//       .input(audioPath)
//       .input(videoPath)
//       .saveToFile(outputPath)
//       .on("end", () => resolve());
//   });

// const parts = [];

// const partDuration = 20;
// const startPause = 0;
// const endPause = 5;
// const fading = 0;

// for (let i = 0; i < 3; i++) {
//   console.log(`Creating part ${i}...`);

//   const musicPath = await createMusicPart(downloadPath, i, startPause, endPause, fading, fading, partDuration);

//   console.log(`Creating video for part ${i}...`);

//   const videoPath = await createVideoPart(partDuration, startPause, endPause);

//   console.log(`Merging audio and video for part ${i}...`);

//   const videoPartPath = `out/tmp/part-${i}.mp4`;

//   await mergeAudioVideo(musicPath, videoPath, videoPartPath);

//   parts.push(videoPartPath);
// }

// console.log("Merging parts...");

// const merger = ffmpeg();

// for (const part of parts) {
//   merger.input(part);
// }

// merger.mergeToFile("out/video.mp4", "out/tmp").on("end", () => console.log("Done!"));

//// TO HERE

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
