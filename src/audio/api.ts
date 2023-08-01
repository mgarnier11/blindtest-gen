import Ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import { Music } from "../utils/interfaces.js";
import { fadedDirPath, outDirPath, tmpDirPath, trackDirPath } from "../utils/config.js";

const createPauseAudio = (duration: number) =>
  new Promise<string>((resolve, reject) => {
    const filename = path.join(tmpDirPath, `pause_${duration}.mp3`);

    if (fs.existsSync(filename)) {
      console.log(`Pause audio for ${duration} seconds already exists`);

      resolve(filename);
    } else {
      console.log(`Creating pause audio for ${duration} seconds...`);

      Ffmpeg()
        .input("anullsrc=channel_layout=stereo:sample_rate=44100")
        .inputFormat("lavfi")
        .inputOptions([`-t ${duration}`])
        .saveToFile(filename)
        .on("end", () => resolve(filename));
    }
  });

const createFadedPart = (music: Music, fadeIn: number, fadeOut: number, duration: number) =>
  new Promise<string>((resolve, reject) => {
    const musicPath = music.localPath;

    const musicFileName = path.basename(musicPath, ".mp3");
    const fadedPath = path.join(fadedDirPath, `${musicFileName}_faded.mp3`);

    if (fs.existsSync(fadedPath)) {
      return resolve(fadedPath);
    }

    console.log(`Creating faded part for ${music.title}...`);

    Ffmpeg()
      .input(musicPath)
      .inputOptions([`-ss ${music.extractStart}`, `-t ${duration}`])
      .audioFilters([`afade=in:st=0:d=${fadeIn},afade=out:st=${duration - fadeOut}:d=${fadeOut}`])
      .saveToFile(fadedPath)
      .on("end", () => resolve(fadedPath));
  });

export const createTrack = async (
  music: Music,
  fadeStart: number,
  fadeEnd: number,
  answerTime: number,
  pauseTime: number
) => {
  const questionTime = music.extractEnd - music.extractStart;

  const duration = questionTime + answerTime;

  const fadedPartPath = await createFadedPart(music, fadeStart, fadeEnd, duration);

  return new Promise<string>(async (resolve, reject) => {
    const musicFileName = path.basename(music.localPath, ".mp3");

    const trackPath = path.join(trackDirPath, `${musicFileName}_track.mp3`);

    console.log(`Merging audio for track ${music.title}...`);

    const merger = Ffmpeg();

    merger.input(fadedPartPath);

    if (pauseTime > 0) {
      const pauseAudioPath = await createPauseAudio(pauseTime);

      merger.input(pauseAudioPath);
    }

    merger.mergeToFile(trackPath, outDirPath).on("end", () => resolve(trackPath));
  });
};
