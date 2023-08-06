import { CanvasRenderingContext2D } from "canvas";
import { Point, Size } from "../../utils/interfaces.js";
import { AllPaths, dumbDeepCopy, setPropertyValue } from "../../utils/utils.js";
import { Effect } from "../effects/effect";
import { Component, ComponentProperties } from "./component.js";
import { CanvasUtils, Color, Corners } from "../canvasUtils.js";

type RectangleProperties = ComponentProperties & {
  size: Size;
  corners: Corners;
};

export class Rectangle extends Component {
  private size: Size;
  private corners: Corners;

  public constructor(position: Point, size: Size, effects: Effect[], color?: Color, corners?: Corners) {
    super(position, effects, color);
    this.size = dumbDeepCopy(size);
    this.corners = dumbDeepCopy<Corners>(
      corners || { type: "corners4", topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 }
    );
  }

  public override getProperties(): RectangleProperties {
    return dumbDeepCopy({
      ...super.getProperties(),
      size: this.size,
      corners: this.corners,
    });
  }

  public override drawComponent(
    context: CanvasRenderingContext2D,
    frame: number,
    updatedProperties: RectangleProperties
  ) {
    CanvasUtils.drawRoundedRectangle(
      context,
      updatedProperties.position,
      updatedProperties.size,
      CanvasUtils.getColorString(updatedProperties.color),
      updatedProperties.corners
    );
  }

  public setProperty(propertyPath: AllPaths<RectangleProperties>, value: any): void {
    return setPropertyValue(this, propertyPath, value);
  }
}
