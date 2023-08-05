import { CanvasRenderingContext2D } from "canvas";
import { Point, Size } from "../../utils/interfaces.js";
import { Effect } from "../effects/effect.js";
import { Component, ComponentProperties } from "./component.js";
import { CanvasUtils } from "../canvasUtils.js";
import { dumbDeepCopy } from "../../utils/utils.js";
import { Text } from "./text.js";
import { Transition } from "../effects/transition.js";
import { Rectangle } from "./rectangle.js";

type ProgressBarProperties = ComponentProperties & {
  size: Size;
  startFrame: number;
  endFrame: number;
};

export class ProgressBar extends Component {
  private _size: Size = { width: 0, height: 0 };
  private _startFrame: number = 0;
  private _endFrame: number = 0;

  public override getProperties(): ProgressBarProperties {
    return dumbDeepCopy({
      ...super.getProperties(),
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

    this.subComponents.set("text", new Text({ x: 5, y: 20 }, [new Transition("position.x", 100, 0, 60)]));

    this.subComponents.set("innerBar", new Rectangle({ x: 0, y: 0 }, { width: 0, height: 0 }, []));
  }

  public override drawComponent(
    context: CanvasRenderingContext2D,
    frame: number,
    updatedProperties: ProgressBarProperties
  ) {
    // CanvasUtils.drawRectangleBorder(context, updatedProperties.position, updatedProperties.size, "#000000");

    let progress = (frame - updatedProperties.startFrame) / (updatedProperties.endFrame - updatedProperties.startFrame);
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;
    const innerSize = {
      width: updatedProperties.size.width - 6,
      height: updatedProperties.size.height - 6,
    };

    // CanvasUtils.drawRectangle(
    //   context,
    //   innerPosition,
    //   {
    //     width: innerSize.width * progress,
    //     height: innerSize.height,
    //   },
    //   "#000000"
    // );

    this.getSubComponent<Rectangle>("innerBar").setSize({
      width: innerSize.width * progress,
      height: innerSize.height,
    });
    this.getSubComponent<Text>("text").setText(`${Math.round(progress * 100)}%`);
  }
}
