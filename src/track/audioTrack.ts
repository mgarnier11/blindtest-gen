import path from "path";
import fs from "fs";
import { Music } from "../utils/interfaces.js";
import { fadedDirPath } from "../utils/config.js";
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
    const fadedPartPath = await this.createFadedPart();
  }
}
