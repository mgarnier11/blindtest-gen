import { CanvasRenderingContext2D } from "canvas";
import { Point, Size } from "../../utils/interfaces.js";
import { AllPaths, dumbDeepCopy, setPropertyValue } from "../../utils/utils.js";
import { Effect } from "../effects/effect";
import { Component, ComponentProperties, ComponentType } from "./component.js";
import { CanvasUtils, Color, Corners } from "../canvasUtils.js";

type RectangleBorderProperties = ComponentProperties & {
  size: Size;
  width: number;
  corners: Corners;
};

const defaultRectangleBorderProperties: RectangleBorderProperties = {
  ...dumbDeepCopy(Component.defaultComponentProperties),
  size: { width: 0, height: 0 },
  width: 0,
  corners: { type: "corners4", topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
};

export class RectangleBorder extends Component {
  public static Builder = class extends Component.Builder {
    builderProperties: RectangleBorderProperties = dumbDeepCopy(defaultRectangleBorderProperties);

    public withSize = (size: Size): this => this.setProperty<RectangleBorderProperties>("size", size);
    public withWidth = (width: number): this => this.setProperty<RectangleBorderProperties>("width", width);
    public withCorners = (corners: Corners): this => this.setProperty<RectangleBorderProperties>("corners", corners);

    public build(): RectangleBorder {
      const component = new RectangleBorder();

      component.setProperties(this.builderProperties);
      component.effects = this.effects;

      return component;
    }
  };
  private constructor() {
    super();
  }

  protected type = ComponentType.RectangleBorder;
  protected override properties: RectangleBorderProperties = dumbDeepCopy(defaultRectangleBorderProperties);

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

  public override setProperty<RectangleBorderProperties>(
    propertyPath: AllPaths<RectangleBorderProperties>,
    value: any
  ) {
    super.setProperty(propertyPath, value);
  }
}
