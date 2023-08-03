import { Music } from "../utils/interfaces.js";
import { AudioTrack } from "./audioTrack.js";
import { VideoTrack } from "./videoTrack.js";

export class Track {
  private videoTrack: VideoTrack;
  private audioTrack: AudioTrack;

  private music: Music;
  private answerTime: number;
  private pauseTime: number;
  private questionTime: number;

  constructor(
    music: Music,
    answerTime: number,
    pauseTime: number,
    audioFadeStart: number = 0,
    audioFadeEnd: number = 0
  ) {
    this.music = music;
    this.answerTime = answerTime;
    this.pauseTime = pauseTime;

    this.questionTime = music.extractEnd - music.extractStart;

    this.videoTrack = new VideoTrack(this.music, this.questionTime, this.answerTime);
    this.audioTrack = new AudioTrack(this.music, audioFadeStart, audioFadeEnd, this.answerTime, this.pauseTime);
  }

  public async createTrack() {
    const audioTrackPath = await this.audioTrack.createTrack();
    const videoTrackPath = await this.videoTrack.createTrack();
  }
}
