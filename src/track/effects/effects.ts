import { Set } from "./set.js";
import { Transition } from "./transition.js";

export class Effects {
  public static Fade(startFrame: number, endFrame: number, direction: "in" | "out") {
    return [
      new Transition.Builder()
        .withProperty("opacity")
        .withEndValue(direction === "in" ? 1 : 0)
        .withStartFrame(startFrame)
        .withEndFrame(endFrame)
        .build(),
      new Set.Builder()
        .withProperty("display")
        .withFrameToSet(direction === "in" ? startFrame : endFrame)
        .withValue(direction === "in" ? true : false)
        .build(),
    ];
  }
}
