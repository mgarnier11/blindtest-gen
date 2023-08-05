import { CanvasRenderingContext2D } from "canvas";
import { getPropertyValue, setPropertyValue } from "../../utils/utils.js";
import { Effect } from "./effect.js";

export enum TransitionType {
  LINEAR = "linear",
  EASE_IN = "ease-in",
  EASE_OUT = "ease-out",
  EASE_IN_OUT = "ease-in-out",
}

export class Transition extends Effect {
  constructor(
    public property: string,
    public endValue: number,
    public startFrame: number,
    public endFrame: number,
    public type: TransitionType = TransitionType.LINEAR
  ) {
    super();
  }

  public override apply(context: CanvasRenderingContext2D, actualFrame: number, properties: any): void {
    if (actualFrame < this.startFrame) return properties;
    if (actualFrame > this.endFrame) {
      setPropertyValue(properties, this.property, this.endValue);
      return properties;
    }

    const startValue = getPropertyValue(properties, this.property);

    let progress = 0;

    if (this.type === TransitionType.LINEAR) {
      progress = (actualFrame - this.startFrame) / (this.endFrame - this.startFrame);
    } else if (this.type === TransitionType.EASE_IN) {
      progress = Math.pow((actualFrame - this.startFrame) / (this.endFrame - this.startFrame), 2);
    } else if (this.type === TransitionType.EASE_OUT) {
      progress = 1 - Math.pow(1 - (actualFrame - this.startFrame) / (this.endFrame - this.startFrame), 2);
    } else if (this.type === TransitionType.EASE_IN_OUT) {
      progress = 0.5 - 0.5 * Math.cos((Math.PI * (actualFrame - this.startFrame)) / (this.endFrame - this.startFrame));
    }

    setPropertyValue(properties, this.property, startValue + (this.endValue - startValue) * progress);

    return properties;
  }

  public updateEndValue(endValue: number) {
    this.endValue = endValue;
  }

  public updateStartFrame(startFrame: number) {
    this.startFrame = startFrame;
  }

  public updateEndFrame(endFrame: number) {
    this.endFrame = endFrame;
  }
}
