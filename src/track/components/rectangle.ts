import { CanvasRenderingContext2D } from "canvas";
import { Point, Size } from "../../utils/interfaces.js";
import { AllPaths, dumbDeepCopy, setPropertyValue } from "../../utils/utils.js";
import { Effect } from "../effects/effect";
import { Component, ComponentProperties, ComponentType } from "./component.js";
import { CanvasUtils, Color, Corners } from "../canvasUtils.js";

type RectangleProperties = ComponentProperties & {
  size: Size;
  corners: Corners;
};

const defaultRectangleProperties: RectangleProperties = {
  ...Component.defaultComponentProperties,
  size: { width: 0, height: 0 },
  corners: { type: "corners4", topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
};

export class Rectangle extends Component {
  public static Builder = class extends Component.Builder {
    builderProperties: RectangleProperties = dumbDeepCopy(defaultRectangleProperties);

    public withSize = (size: Size): this => this.setProperty<RectangleProperties>("size", size);
    public withCorners = (corners: Corners): this => this.setProperty<RectangleProperties>("corners", corners);

    public build(): Rectangle {
      const component = new Rectangle();

      component.setProperties(this.builderProperties);
      component.effects = this.effects;

      return component;
    }
  };
  private constructor() {
    super();
  }

  protected type = ComponentType.Rectangle;
  protected override properties: RectangleProperties = dumbDeepCopy(defaultRectangleProperties);

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

  public override setProperty<RectangleProperties>(propertyPath: AllPaths<RectangleProperties>, value: any) {
    super.setProperty(propertyPath, value);
  }
}
