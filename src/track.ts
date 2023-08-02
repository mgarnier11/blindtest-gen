import { Music } from "./utils/interfaces.js";

export class Track {
  private music: Music;
  private answerTime: number;
  private pauseTime: number;

  constructor(music: Music, answerTime: number, pauseTime: number) {
    this.music = music;
    this.answerTime = answerTime;
    this.pauseTime = pauseTime;
  }

  public async createTrack() {}

  private async createVideoTrack() {}

  private async createAudioTrack(fadeStart: number, fadeEnd: number) {}
}
