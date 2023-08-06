import { CanvasRenderingContext2D } from "canvas";
import { Effect, EffectProperties, EffectType } from "./effect.js";
import { dumbDeepCopy, getPropertyValue, setPropertyValue } from "../../utils/utils.js";

type SetProperties = EffectProperties & {
  property: string;
  frameToSet: number;
  value: any;
};

const defaultSetProperties: SetProperties = {
  property: "",
  frameToSet: 0,
  value: null,
};

export class Set extends Effect {
  public static Builder = class extends Effect.Builder {
    builderProperties: SetProperties = dumbDeepCopy(defaultSetProperties);

    public withProperty = (property: string): this => this.setProperty<SetProperties>("property", property);
    public withFrameToSet = (frameToSet: number): this => this.setProperty<SetProperties>("frameToSet", frameToSet);
    public withValue = (value: any): this => this.setProperty<SetProperties>("value", value);

    public build = (): Set => this.buildEffect<Set>(EffectType.Set);
  };

  protected type = EffectType.Set;
  protected override properties: SetProperties = dumbDeepCopy(defaultSetProperties);

  public override apply(context: CanvasRenderingContext2D, actualFrame: number, properties: any): void {
    if (actualFrame >= this.properties.frameToSet) {
      setPropertyValue(properties, this.properties.property, this.properties.value);
    }

    return properties;
  }
}
