export interface KeyFrame {
  time: number;
  value: number;
  easing?: "expo-out" | "cubic-in-out";
}
