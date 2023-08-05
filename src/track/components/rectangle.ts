import { CanvasRenderingContext2D } from "canvas";
import { Point, Size } from "../../utils/interfaces.js";
import { dumbDeepCopy } from "../../utils/utils.js";
import { Effect } from "../effects/effect";
import { Component, ComponentProperties } from "./component.js";
import { CanvasUtils } from "../canvasUtils.js";

type RectangleProperties = ComponentProperties & {
  size: Size;
};

export class Rectangle extends Component {
  private _size: Size = { width: 0, height: 0 };

  public constructor(position: Point, size: Size, effects: Effect[]) {
    super(position, effects);
    this._size.width = size.width;
    this._size.height = size.height;
  }

  public override getProperties(): RectangleProperties {
    return dumbDeepCopy({
      ...super.getProperties(),
      size: this._size,
    });
  }

  public override drawComponent(
    context: CanvasRenderingContext2D,
    frame: number,
    updatedProperties: RectangleProperties
  ) {
    CanvasUtils.drawRectangle(context, updatedProperties.position, updatedProperties.size, "#000000");
  }

  public setSize(size: Size) {
    this._size.width = size.width;
    this._size.height = size.height;
  }
}
