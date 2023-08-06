import { CanvasRenderingContext2D } from "canvas";
import { Effect } from "./effect.js";
import { getPropertyValue, setPropertyValue } from "../../utils/utils.js";
import { CanvasUtils } from "../canvasUtils.js";

export class BorderAnimation extends Effect {
  constructor(
    public startFrame: number,
    public borderDuration: number,
    public borderDelay: number,
    public nbBorders: number
  ) {
    super();
  }

  public override apply(context: CanvasRenderingContext2D, actualFrame: number, properties: any): void {
    const componentSize = getPropertyValue(properties, "size");
    const borderSettings = getPropertyValue(properties, "borderSettings");

    if (
      actualFrame >= this.startFrame &&
      actualFrame < this.startFrame + this.borderDuration * this.nbBorders + this.borderDelay * (this.nbBorders - 1)
    ) {
      for (let i = 0; i < this.nbBorders; i++) {
        const frameDiff = actualFrame - this.startFrame - this.borderDelay * i;
        if (frameDiff > 0 && frameDiff < this.borderDuration) {
          context.save();

          context.globalAlpha = 1 - frameDiff / this.borderDuration;

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
