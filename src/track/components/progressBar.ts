import { CanvasRenderingContext2D } from "canvas";
import { Point, Size } from "../../utils/interfaces.js";
import { Effect } from "../effects/effect.js";
import { Component, ComponentProperties } from "./component.js";
import { AllPaths, dumbDeepCopy, setPropertyValue } from "../../utils/utils.js";
import { Text } from "./text.js";
import { Rectangle } from "./rectangle.js";
import { RectangleBorder } from "./rectangleBorder.js";
import { Transition, TransitionType } from "../effects/transition.js";
import { Color, Corners } from "../canvasUtils.js";
import { BorderAnimation } from "../effects/borderAnimation.js";

interface ProgressSettings {
  offset: Size;
  color: Color;
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

export class ProgressBar extends Component {
  private size: Size;
  private startFrame: number;
  private endFrame: number;
  private progressSettings: ProgressSettings;
  private borderSettings: BorderSettings;
  private transitionType: TransitionType;

  public override getProperties(): ProgressBarProperties {
    return dumbDeepCopy({
      ...super.getProperties(),
      size: this.size,
      startFrame: this.startFrame,
      endFrame: this.endFrame,
      progressSettings: this.progressSettings,
      borderSettings: this.borderSettings,
      transitionType: this.transitionType,
    });
  }

  private progressTransition: Transition;

  public constructor(
    position: Point,
    size: Size,
    startFrame: number,
    endFrame: number,
    effects: Effect[],
    progressSettings?: ProgressSettings,
    borderSettings?: BorderSettings,
    transitionType?: TransitionType
  ) {
    super(position, [...effects, new BorderAnimation(endFrame, 5, 3, 3)]);
    this.size = dumbDeepCopy(size);
    this.startFrame = startFrame;
    this.endFrame = endFrame;
    this.progressSettings = dumbDeepCopy(
      progressSettings || {
        offset: { width: 0, height: 0 },
        color: "",
        corners: 0,
      }
    );
    this.borderSettings = dumbDeepCopy(
      borderSettings || {
        width: 0,
        color: "",
        corners: 0,
      }
    );
    this.transitionType = transitionType || TransitionType.EASE_IN_OUT;

    this.progressTransition = new Transition(
      "size.width",
      size.width - this.progressSettings.offset.width * 2,
      startFrame,
      endFrame,
      TransitionType.EASE_IN_OUT
    );

    this.subComponents.set(
      "border",
      new RectangleBorder(
        { x: 0, y: 0 },
        { width: 0, height: 0 },
        this.borderSettings.width,
        [],
        this.borderSettings.color,
        this.borderSettings.corners
      )
    );
    this.subComponents.set(
      "progress",
      new Rectangle(
        { x: this.progressSettings.offset.width, y: this.progressSettings.offset.width },
        { width: 0, height: 0 },
        [this.progressTransition],
        this.progressSettings.color,
        this.progressSettings.corners
      )
    );
  }

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
    progress.setProperty("color", updatedProperties.progressSettings.color);
    progress.setProperty("corners", updatedProperties.progressSettings.corners);

    this.progressTransition.updateEndValue(
      updatedProperties.size.width - updatedProperties.progressSettings.offset.width * 2
    );
  }

  public setProperty(propertyPath: AllPaths<ProgressBarProperties>, value: any): void {
    return setPropertyValue(this, propertyPath, value);
  }
}
