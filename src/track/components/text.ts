import { CanvasRenderingContext2D } from "canvas";
import { Component, ComponentProperties } from "./component.js";
import { Point } from "../../utils/interfaces.js";
import { Effect } from "../effects/effect.js";
import { AllPaths, dumbDeepCopy, setPropertyValue } from "../../utils/utils.js";
import { CanvasUtils, Color } from "../canvasUtils.js";

interface FontSettings {
  size: number;
  family: string;
}

type TextProperties = ComponentProperties & {
  textAlign: CanvasTextAlign;
  fontSettings: FontSettings;
  text: string;
};

export class Text extends Component {
  private textAlign: CanvasTextAlign;
  private fontSettings: FontSettings;
  private text: string;

  public override getProperties(): TextProperties {
    return dumbDeepCopy({
      ...super.getProperties(),
      textAlign: this.textAlign,
      fontSettings: this.fontSettings,
      text: this.text,
    });
  }

  public constructor(
    position: Point,
    effects: Effect[],
    text?: string,
    textAlign?: CanvasTextAlign,
    fontSettings?: FontSettings,
    color?: Color
  ) {
    super(position, effects, color);
    this.textAlign = textAlign || "left";
    this.fontSettings = dumbDeepCopy(fontSettings || { size: 100, family: "Arial" });
    this.text = text || "";
  }

  public override draw(context: CanvasRenderingContext2D, frame: number, text: string) {
    super.draw(context, frame, text);
  }

  public override drawComponent(
    context: CanvasRenderingContext2D,
    frame: number,
    updatedProperties: TextProperties,
    text?: string
  ) {
    context.font = `${updatedProperties.fontSettings.size}px ${updatedProperties.fontSettings.family}`;
    context.fillStyle = CanvasUtils.getColorString(updatedProperties.color);
    context.textAlign = updatedProperties.textAlign;

    context.fillText(text ? text : this.text, updatedProperties.position.x, updatedProperties.position.y);
  }

  public setProperty(propertyPath: AllPaths<TextProperties>, value: any): void {
    return setPropertyValue(this, propertyPath, value);
  }
}
