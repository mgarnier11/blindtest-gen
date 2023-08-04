import { CanvasRenderingContext2D } from "canvas";
import { Point, Size } from "../../utils/interfaces.js";
import { Effect } from "../effects/effect.js";
import { Component } from "./component.js";
import { CanvasUtils } from "../canvasUtils.js";
import { dumbDeepCopy } from "../../utils/utils.js";

interface ProgressBarProperties {
  position: Point;
  size: Size;
  startFrame: number;
  endFrame: number;
}

export class ProgressBar extends Component {
  private _size: Size = { width: 0, height: 0 };
  private _startFrame: number = 0;
  private _endFrame: number = 0;

  public override getProperties(): ProgressBarProperties {
    return dumbDeepCopy({
      position: this.position,
      size: this._size,
      startFrame: this._startFrame,
      endFrame: this._endFrame,
    });
  }

  public constructor(position: Point, size: Size, startFrame: number, endFrame: number, effects: Effect[]) {
    super(position, effects);
    this._size.width = size.width;
    this._size.height = size.height;
    this._startFrame = startFrame;
    this._endFrame = endFrame;
  }

  public override draw(context: CanvasRenderingContext2D, frame: number): void {
    const updatedProperties = this.applyEffects(context, frame);

    context.save();
    CanvasUtils.drawRectangleBorder(context, updatedProperties.position, updatedProperties.size, "#000000");

    let progress = (frame - updatedProperties.startFrame) / (updatedProperties.endFrame - updatedProperties.startFrame);
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;
    const innerPosition = { x: updatedProperties.position.x + 3, y: updatedProperties.position.y + 3 };
    const innerSize = {
      width: updatedProperties.size.width - 6,
      height: updatedProperties.size.height - 6,
    };

    CanvasUtils.drawRectangle(
      context,
      innerPosition,
      {
        width: innerSize.width * progress,
        height: innerSize.height,
      },
      "#000000"
    );
    context.restore();
  }
}
