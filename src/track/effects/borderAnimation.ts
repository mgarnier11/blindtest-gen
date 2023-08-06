import { CanvasRenderingContext2D } from "canvas";
import { Effect, EffectProperties, EffectType } from "./effect.js";
import { dumbDeepCopy, getPropertyValue, setPropertyValue } from "../../utils/utils.js";
import { CanvasUtils } from "../canvasUtils.js";

type BorderAnimationProperties = EffectProperties & {
  startFrame: number;
  endFrame: number;
  borderDelay: number;
  nbBorders: number;
};

export class BorderAnimation extends Effect {
  constructor(
    public startFrame: number,
    public endFrame: number,
    public borderDelay: number,
    public nbBorders: number
  ) {
    super();
    this.type = EffectType.BorderAnimation;
  }

  public override getProperties(): BorderAnimationProperties {
    return dumbDeepCopy({
      startFrame: this.startFrame,
      endFrame: this.endFrame,
      borderDelay: this.borderDelay,
      nbBorders: this.nbBorders,
    });
  }

  public override apply(context: CanvasRenderingContext2D, actualFrame: number, properties: any): void {
    if (actualFrame >= this.startFrame && actualFrame < this.endFrame) {
      const componentSize = getPropertyValue(properties, "size");
      const borderSettings = getPropertyValue(properties, "borderSettings");
      const animationDuration = this.endFrame - this.startFrame;
      const borderDuration = animationDuration - this.borderDelay * (this.nbBorders - 1);

      for (let i = 0; i < this.nbBorders; i++) {
        const frameDiff = actualFrame - this.startFrame - this.borderDelay * i;
        if (frameDiff > 0 && frameDiff < borderDuration) {
          context.save();

          context.globalAlpha = 1 - frameDiff / borderDuration;

          const offset = frameDiff * (borderSettings.width * 0.75);

          CanvasUtils.drawRoundedRectangleBorder(
            context,
            {
              x: properties.position.x + borderSettings.width / 2 - offset,
              y: properties.position.y + borderSettings.width / 2 - offset,
            },
            {
              height: componentSize.height - borderSettings.width + offset * 2,
              width: componentSize.width - borderSettings.width + offset * 2,
            },
            CanvasUtils.getColorString(borderSettings.color),
            borderSettings.corners,
            borderSettings.width * 0.75
          );

          context.restore();
        }
      }
    }

    return properties;
  }
}
