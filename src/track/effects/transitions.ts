import { Set } from "./set.js";
import { Transition } from "./transition.js";

export class Effects {
  public static Fade(startFrame: number, endFrame: number, direction: "in" | "out") {
    return [
      new Transition("opacity", direction === "in" ? 1 : 0, startFrame, endFrame),
      new Set("display", direction === "in" ? startFrame : endFrame, direction === "in" ? true : false),
    ];
  }
}
