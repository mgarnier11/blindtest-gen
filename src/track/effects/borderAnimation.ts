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

const defaultBorderAnimationProperties: BorderAnimationProperties = {
  startFrame: 0,
  endFrame: 0,
  borderDelay: 0,
  nbBorders: 0,
};

export class BorderAnimation extends Effect {
  public static Builder = class extends Effect.Builder {
    builderProperties: BorderAnimationProperties = dumbDeepCopy(defaultBorderAnimationProperties);

    public withStartFrame = (startFrame: number): this =>
      this.setProperty<BorderAnimationProperties>("startFrame", startFrame);
    public withEndFrame = (endFrame: number): this => this.setProperty<BorderAnimationProperties>("endFrame", endFrame);
    public withBorderDelay = (borderDelay: number): this =>
      this.setProperty<BorderAnimationProperties>("borderDelay", borderDelay);
    public withNbBorders = (nbBorders: number): this =>
      this.setProperty<BorderAnimationProperties>("nbBorders", nbBorders);

    public build = (): BorderAnimation => this.buildEffect<BorderAnimation>(EffectType.BorderAnimation);
  };

  protected type = EffectType.BorderAnimation;
  protected override properties: BorderAnimationProperties = dumbDeepCopy(defaultBorderAnimationProperties);

  public override apply(context: CanvasRenderingContext2D, actualFrame: number, properties: any): void {
    const startFrame = this.properties.startFrame;
    const endFrame = this.properties.endFrame;

    if (actualFrame >= startFrame && actualFrame < endFrame) {
      const componentSize = getPropertyValue(properties, "size");
      const borderSettings = getPropertyValue(properties, "borderSettings");
      const animationDuration = endFrame - startFrame;
      const borderDelay = this.properties.borderDelay;
      const nbBorders = this.properties.nbBorders;
      const borderDuration = animationDuration - borderDelay * (nbBorders - 1);

      for (let i = 0; i < nbBorders; i++) {
        const frameDiff = actualFrame - startFrame - borderDelay * i;
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
