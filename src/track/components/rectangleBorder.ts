import { CanvasRenderingContext2D } from "canvas";
import { Point, Size } from "../../utils/interfaces.js";
import { AllPaths, dumbDeepCopy, setPropertyValue } from "../../utils/utils.js";
import { Effect } from "../effects/effect";
import { Component, ComponentProperties } from "./component.js";
import { CanvasUtils, Color, Corners } from "../canvasUtils.js";

type RectangleBorderProperties = ComponentProperties & {
  size: Size;
  width: number;
  corners: Corners;
};

export class RectangleBorder extends Component {
  private size: Size;
  private width: number;
  private corners: Corners;

  public constructor(position: Point, size: Size, width: number, effects: Effect[], color?: Color, corners?: Corners) {
    super(position, effects, color);
    this.size = dumbDeepCopy(size);
    this.width = width;
    this.corners = dumbDeepCopy(corners || { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 });
  }

  public override getProperties(): RectangleBorderProperties {
    return dumbDeepCopy({
      ...super.getProperties(),
      size: this.size,
      width: this.width,
      corners: this.corners,
    });
  }

  public override drawComponent(
    context: CanvasRenderingContext2D,
    frame: number,
    updatedProperties: RectangleBorderProperties
  ) {
    CanvasUtils.drawRoundedRectangleBorder(
      context,
      {
        x: updatedProperties.position.x + updatedProperties.width / 2,
        y: updatedProperties.position.y + updatedProperties.width / 2,
      },
      {
        width: updatedProperties.size.width - updatedProperties.width,
        height: updatedProperties.size.height - updatedProperties.width,
      },
      CanvasUtils.getColorString(updatedProperties.color),
      updatedProperties.corners,
      updatedProperties.width
    );
  }

  public setProperty(propertyPath: AllPaths<RectangleBorderProperties>, value: any): void {
    return setPropertyValue(this, propertyPath, value);
  }
}
