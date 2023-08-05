import { CanvasRenderingContext2D } from "canvas";
import { Effect } from "./effect.js";
import { getPropertyValue, setPropertyValue } from "../../utils/utils.js";

export class Switch extends Effect {
  constructor(public property: string, public framesToSwitch: number[]) {
    super();
  }

  public override apply(context: CanvasRenderingContext2D, actualFrame: number, properties: any): void {
    let propertyValue = getPropertyValue(properties, this.property);

    let framesLessThanActualFrame = 0;
    for (const frame of this.framesToSwitch) {
      if (frame <= actualFrame) framesLessThanActualFrame++;
    }

    if (framesLessThanActualFrame % 2 !== 0) {
      setPropertyValue(properties, this.property, !propertyValue);
    }

    return properties;
  }
}
