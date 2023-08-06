import { CanvasRenderingContext2D } from "canvas";
import { Effect, EffectProperties, EffectType } from "./effect.js";
import { dumbDeepCopy, getPropertyValue, setPropertyValue } from "../../utils/utils.js";

type SetProperties = EffectProperties & {
  property: string;
  frameToSet: number;
  value: any;
};

export class Set extends Effect {
  constructor(public property: string, public frameToSet: number, public value: any) {
    super();
    this.type = EffectType.Set;
  }

  public override getProperties(): SetProperties {
    return dumbDeepCopy({
      property: this.property,
      frameToSet: this.frameToSet,
      value: this.value,
    });
  }

  public override apply(context: CanvasRenderingContext2D, actualFrame: number, properties: any): void {
    if (actualFrame >= this.frameToSet) {
      setPropertyValue(properties, this.property, this.value);
    }

    return properties;
  }
}
