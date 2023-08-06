import { CanvasRenderingContext2D } from "canvas";
import { Effect, EffectProperties, EffectType } from "./effect.js";
import { dumbDeepCopy, getPropertyValue, setPropertyValue } from "../../utils/utils.js";

type SwitchProperties = EffectProperties & {
  property: string;
  framesToSwitch: number[];
};

export class Switch extends Effect {
  constructor(public property: string, public framesToSwitch: number[]) {
    super();
    this.type = EffectType.Switch;
  }

  public override getProperties(): SwitchProperties {
    return dumbDeepCopy({
      property: this.property,
      framesToSwitch: this.framesToSwitch,
    });
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
