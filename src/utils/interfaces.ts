export interface KeyFrame {
  time: number;
  value: number;
  easing?: "expo-out" | "cubic-in-out";
}

export interface Music {
  name: string;
  artist: string;
  duration: number;
  localPath: string;
  thumbnailUrl: string;
}
