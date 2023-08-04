import { CanvasRenderingContext2D } from "canvas";
import { getPropertyValue, setPropertyValue } from "../../utils/utils.js";
import { Effect } from "./effect.js";

export class Transition extends Effect {
  constructor(
    public property: string,
    public endValue: number,
    public startFrame: number,
    public frameDuration: number
  ) {
    super();
  }

  public override apply(context: CanvasRenderingContext2D, actualFrame: number, properties: any): void {
    if (actualFrame < this.startFrame) return properties;

    const startValue = getPropertyValue(properties, this.property);

    const progress = (actualFrame - this.startFrame) / this.frameDuration;

    if (progress > 1) {
      setPropertyValue(properties, this.property, this.endValue);
    } else {
      setPropertyValue(properties, this.property, startValue + (this.endValue - startValue) * progress);
    }

    return properties;
  }
}
