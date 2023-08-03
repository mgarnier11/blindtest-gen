import { Music } from "../utils/interfaces.js";

export class VideoTrack {
  private music: Music;
  private answerTime: number;
  private pauseTime: number;
  private questionTime: number;

  constructor(music: Music, answerTime: number, pauseTime: number) {
    this.music = music;
    this.answerTime = answerTime;
    this.pauseTime = pauseTime;

    this.questionTime = music.extractEnd - music.extractStart;
  }
}
