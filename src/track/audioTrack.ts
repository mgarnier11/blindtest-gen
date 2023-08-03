import path from "path";
import fs from "fs";
import { Music } from "../utils/interfaces.js";
import { fadedDirPath, outDirPath, tmpDirPath, trackDirPath } from "../utils/config.js";
import Ffmpeg from "fluent-ffmpeg";

export class AudioTrack {
  private music: Music;
  private answerTime: number;
  private pauseTime: number;
  private questionTime: number;
  private fadeStart: number;
  private fadeEnd: number;

  private trackDuration: number;

  private musicPath: string;
  private musicFileName: string;

  private _trackPath: string;
  public get trackPath(): string {
    return this._trackPath;
  }

  constructor(music: Music, fadeStart: number, fadeEnd: number, answerTime: number, pauseTime: number) {
    this.music = music;
    this.answerTime = answerTime;
    this.pauseTime = pauseTime;
    this.fadeStart = fadeStart;
    this.fadeEnd = fadeEnd;

    this.questionTime = music.extractEnd - music.extractStart;
    this.trackDuration = this.questionTime + this.answerTime;

    this.musicPath = music.localPath;
    this.musicFileName = path.basename(this.musicPath, ".mp3");

    this._trackPath = path.join(trackDirPath, `${this.musicFileName}_track.mp3`);
  }

  public static createPauseAudio(duration: number) {
    return new Promise<string>((resolve, reject) => {
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
  }

  private createFadedPart() {
    return new Promise<string>((resolve, reject) => {
      const fadedPath = path.join(fadedDirPath, `${this.musicFileName}_faded.mp3`);

      if (fs.existsSync(fadedPath)) {
        return resolve(fadedPath);
      }

      console.log(`Creating faded part for ${this.music.title}...`);

      Ffmpeg()
        .input(this.musicPath)
        .inputOptions([`-ss ${this.music.extractStart}`, `-t ${this.trackDuration}`])
        .audioFilters([
          `afade=in:st=0:d=${this.fadeStart},afade=out:st=${this.trackDuration - this.fadeEnd}:d=${this.fadeEnd}`,
        ])
        .saveToFile(fadedPath)
        .on("end", () => resolve(fadedPath));
    });
  }

  public async createTrack(): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const fadedPartPath = await this.createFadedPart();

      console.log(`Merging audio for track ${this.music.title}...`);

      const merger = Ffmpeg();

      merger.input(fadedPartPath);

      if (this.pauseTime > 0) {
        const pauseAudioPath = await AudioTrack.createPauseAudio(this.pauseTime);

        merger.input(pauseAudioPath);
      }

      merger.mergeToFile(this.trackPath, tmpDirPath).on("end", () => resolve(this.trackPath));
    });
  }
}
