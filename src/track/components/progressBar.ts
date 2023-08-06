import { CanvasRenderingContext2D } from "canvas";
import { Point, Size } from "../../utils/interfaces.js";
import { Effect } from "../effects/effect.js";
import { Component, ComponentProperties, ComponentType } from "./component.js";
import { AllPaths, dumbDeepCopy, setPropertyValue } from "../../utils/utils.js";
import { Text } from "./text.js";
import { Rectangle } from "./rectangle.js";
import { RectangleBorder } from "./rectangleBorder.js";
import { Transition, TransitionType } from "../effects/transition.js";
import { Color, Corners } from "../canvasUtils.js";
import { BorderAnimation } from "../effects/borderAnimation.js";

interface ProgressSettings {
  offset: Size;
  corners: Corners;
}

interface BorderSettings {
  width: number;
  color: Color;
  corners: Corners;
}

type ProgressBarProperties = ComponentProperties & {
  size: Size;
  startFrame: number;
  endFrame: number;
  progressSettings: ProgressSettings;
  borderSettings: BorderSettings;
  transitionType: TransitionType;
};

const defaultProgressBarProperties: ProgressBarProperties = {
  ...Component.defaultComponentProperties,
  size: { width: 0, height: 0 },
  startFrame: 0,
  endFrame: 0,
  progressSettings: {
    offset: { width: 0, height: 0 },
    corners: 0,
  },
  borderSettings: {
    width: 0,
    color: { type: "rgba", r: 0, g: 0, b: 0 },
    corners: 0,
  },
  transitionType: TransitionType.EASE_IN_OUT,
};

export class ProgressBar extends Component {
  public static Builder = class extends Component.Builder {
    builderProperties: ProgressBarProperties = dumbDeepCopy(defaultProgressBarProperties);

    public withSize = (size: Size): this => this.setProperty<ProgressBarProperties>("size", size);
    public withStartFrame = (startFrame: number): this =>
      this.setProperty<ProgressBarProperties>("startFrame", startFrame);
    public withEndFrame = (endFrame: number): this => this.setProperty<ProgressBarProperties>("endFrame", endFrame);
    public withProgressSettings = (progressSettings: ProgressSettings): this =>
      this.setProperty<ProgressBarProperties>("progressSettings", progressSettings);
    public withBorderSettings = (borderSettings: BorderSettings): this =>
      this.setProperty<ProgressBarProperties>("borderSettings", borderSettings);
    public withTransitionType = (transitionType: TransitionType): this =>
      this.setProperty<ProgressBarProperties>("transitionType", transitionType);

    public build(framerate: number): ProgressBar {
      const component = new ProgressBar();

      component.setProperties(this.builderProperties);
      component.effects = [
        ...this.effects,
        new BorderAnimation(this.builderProperties.endFrame, this.builderProperties.endFrame + framerate * 0.25, 2, 3),
      ];

      component.progressTransition = new Transition(
        "size.width",
        this.builderProperties.size.width - this.builderProperties.progressSettings.offset.width * 2,
        this.builderProperties.startFrame,
        this.builderProperties.endFrame,
        this.builderProperties.transitionType
      );
      component.subComponents.set(
        "border",
        new RectangleBorder.Builder()
          .withPosition({ x: 0, y: 0 })
          .withSize({ width: 0, height: 0 })
          .withWidth(this.builderProperties.borderSettings.width)
          .withColor(this.builderProperties.borderSettings.color)
          .withCorners(this.builderProperties.borderSettings.corners)
          .build()
      );
      component.subComponents.set(
        "progress",
        new Rectangle.Builder()
          .withPosition({ x: this.builderProperties.progressSettings.offset.width, y: 0 })
          .withSize({ width: 0, height: 0 })
          .withColor(this.builderProperties.color)
          .withCorners(this.builderProperties.progressSettings.corners)
          .withEffects([component.progressTransition])
          .build()
      );

      return component;
    }
  };
  private constructor() {
    super();
  }

  protected type = ComponentType.ProgressBar;
  protected override properties: ProgressBarProperties = dumbDeepCopy(defaultProgressBarProperties);
  private progressTransition!: Transition;

  public override drawComponent(
    context: CanvasRenderingContext2D,
    frame: number,
    updatedProperties: ProgressBarProperties
  ) {
    const border = this.getSubComponent<RectangleBorder>("border");
    border.setProperty("size", updatedProperties.size);
    border.setProperty("color", updatedProperties.borderSettings.color);
    border.setProperty("width", updatedProperties.borderSettings.width);
    border.setProperty("corners", updatedProperties.borderSettings.corners);

    const progress = this.getSubComponent<Rectangle>("progress");
    progress.setProperty("position.x", updatedProperties.progressSettings.offset.width);
    progress.setProperty("position.y", updatedProperties.progressSettings.offset.height);
    progress.setProperty(
      "size.height",
      updatedProperties.size.height - updatedProperties.progressSettings.offset.height * 2
    );
    progress.setProperty("color", updatedProperties.color);
    progress.setProperty("corners", updatedProperties.progressSettings.corners);

    this.progressTransition.updateEndValue(
      updatedProperties.size.width - updatedProperties.progressSettings.offset.width * 2
    );
  }

  public override setProperty<ProgressBarProperties>(propertyPath: AllPaths<ProgressBarProperties>, value: any) {
    super.setProperty(propertyPath, value);
  }
}
