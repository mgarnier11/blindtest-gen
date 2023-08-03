import { getPropertyValue, setPropertyValue } from "../../utils/utils.js";
import { Effect } from "./effect.js";

export class Translate extends Effect {
  constructor(
    public property: string,
    public endPosition: number,
    public startFrame: number,
    public frameDuration: number
  ) {
    super();
  }

  public override apply(actualFrame: number, properties: any): void {
    if (actualFrame < this.startFrame) return properties;

    const startPosition = getPropertyValue(properties, this.property);

    const progress = (actualFrame - this.startFrame) / this.frameDuration;

    if (progress > 1) {
      setPropertyValue(properties, this.property, this.endPosition);
    } else {
      setPropertyValue(properties, this.property, startPosition + (this.endPosition - startPosition) * progress);
    }

    return properties;
  }
}
