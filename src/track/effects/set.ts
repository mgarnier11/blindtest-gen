import { CanvasRenderingContext2D } from "canvas";
import { Effect } from "./effect.js";
import { getPropertyValue, setPropertyValue } from "../../utils/utils.js";

export class Set extends Effect {
  constructor(public property: string, public frameToSet: number, public value: any) {
    super();
  }

  public override apply(context: CanvasRenderingContext2D, actualFrame: number, properties: any): void {
    if (actualFrame >= this.frameToSet) {
      setPropertyValue(properties, this.property, this.value);
    }

    return properties;
  }
}
