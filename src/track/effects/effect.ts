import { CanvasRenderingContext2D } from "canvas";
import { dumbDeepCopy } from "../../utils/utils";

export enum EffectType {
  Unknown = "Unknown",
  BorderAnimation = "BorderAnimation",
  Switch = "Switch",
  Transition = "Transition",
  Set = "Set",
}

export interface EffectProperties {}

export abstract class Effect {
  protected type: EffectType = EffectType.Unknown;

  public abstract apply(context: CanvasRenderingContext2D, actualFrame: number, properties: any): any;

  public abstract getProperties(): EffectProperties;

  public toJSON(): any {
    return {
      ...this.getProperties(),
      type: this.type,
    };
  }
}
