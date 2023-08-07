import { CanvasRenderingContext2D } from "canvas";
import { dumbDeepCopy, generateId } from "../../utils/utils.js";

export enum EffectType {
  Unknown = "Unknown",
  BorderAnimation = "BorderAnimation",
  Switch = "Switch",
  Transition = "Transition",
  Set = "Set",
}

export interface EffectProperties {}

const effectTypeToClass = {
  [EffectType.Unknown]: null,
};

export abstract class Effect {
  public static typeToClass: any = undefined;
  public static async setTypeToClass() {
    Effect.typeToClass = {
      [EffectType.BorderAnimation]: (await import("./borderAnimation.js")).BorderAnimation,
      [EffectType.Switch]: (await import("./switch.js")).Switch,
      [EffectType.Transition]: (await import("./transition.js")).Transition,
      [EffectType.Set]: (await import("./set.js")).Set,
    };
  }

  public static defaultEffectProperties: EffectProperties = {};
  public static Builder = class {
    protected builderProperties: EffectProperties = dumbDeepCopy(Effect.defaultEffectProperties);

    protected setProperty<T>(propertyPath: keyof T, value: any): this {
      if (typeof value === "object") {
        (this.builderProperties as any)[propertyPath] = dumbDeepCopy(value);
      } else {
        (this.builderProperties as any)[propertyPath] = value;
      }

      return this;
    }

    protected buildEffect<T extends Effect>(type: EffectType): T {
      const EffectClass = Effect.typeToClass[type];

      if (!EffectClass) {
        throw new Error(`Unknown effect type: ${type}`);
      }

      const effect = new EffectClass() as Effect;

      effect.setProperties(this.builderProperties);

      return effect as T;
    }
  };

  protected properties: EffectProperties = dumbDeepCopy(Effect.defaultEffectProperties);
  protected type: EffectType = EffectType.Unknown;
  protected id: string = generateId();
  public getId = (): string => this.id;

  public abstract apply(context: CanvasRenderingContext2D, actualFrame: number, properties: any): any;

  protected setProperties(properties: EffectProperties) {
    this.properties = dumbDeepCopy(properties);
  }

  public getProperties(): EffectProperties {
    return dumbDeepCopy(this.properties);
  }
  public toJSON(): any {
    return {
      properties: this.getProperties(),
      type: this.type,
      id: this.id,
    };
  }

  public static fromJSON<T extends Effect>(json: any): T {
    const EffectClass = Effect.typeToClass[json.type as EffectType];

    if (!EffectClass) {
      throw new Error(`Unknown effect type: ${json.type}`);
    }

    const effect = new EffectClass() as Effect;

    effect.id = json.id;
    effect.setProperties(json.properties);

    return effect as T;
  }
}

export const registerEffects = async () => {
  await Effect.setTypeToClass();
};
