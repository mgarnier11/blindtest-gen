import { CanvasRenderingContext2D } from "canvas";
import { Effect, EffectProperties, EffectType } from "./effect.js";
import { dumbDeepCopy, getPropertyValue, setPropertyValue } from "../../utils/utils.js";

type SwitchProperties = EffectProperties & {
  property: string;
  framesToSwitch: number[];
};

const defaultSwitchProperties: SwitchProperties = {
  property: "",
  framesToSwitch: [],
};

export class Switch extends Effect {
  public static Builder = class extends Effect.Builder {
    builderProperties: SwitchProperties = dumbDeepCopy(defaultSwitchProperties);

    public withProperty = (property: string): this => this.setProperty<SwitchProperties>("property", property);
    public withFramesToSwitch = (framesToSwitch: number[]): this =>
      this.setProperty<SwitchProperties>("framesToSwitch", framesToSwitch);

    public build = (): Switch => this.buildEffect<Switch>(EffectType.Switch);
  };

  protected type = EffectType.Switch;
  protected override properties: SwitchProperties = dumbDeepCopy(defaultSwitchProperties);

  public override apply(context: CanvasRenderingContext2D, actualFrame: number, properties: any): void {
    let propertyValue = getPropertyValue(properties, this.properties.property);

    let framesLessThanActualFrame = 0;
    for (const frame of this.properties.framesToSwitch) {
      if (frame <= actualFrame) framesLessThanActualFrame++;
    }

    if (framesLessThanActualFrame % 2 !== 0) {
      setPropertyValue(properties, this.properties.property, !propertyValue);
    }

    return properties;
  }
}
