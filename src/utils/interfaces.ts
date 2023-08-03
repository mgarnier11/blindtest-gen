export interface KeyFrame {
  time: number;
  value: number;
  easing?: "expo-out" | "cubic-in-out";
}

export interface MusicRequest {
  title: string;
  artist: string;
  timestamp_start: number;
  timestamp_end: number;
}

export interface Music {
  title: string;
  artist: string;
  duration: number;
  localPath: string;
  thumbnailUrl: string;
  extractStart: number;
  extractEnd: number;
}

export interface Point {
  x: number;
  y: number;
}
