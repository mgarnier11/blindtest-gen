import { CanvasRenderingContext2D } from "canvas";
import { Component } from "./component.js";
import { Point } from "../../utils/interfaces.js";
import { Effect } from "../effects/effect.js";
import { dumbDeepCopy } from "../../utils/utils.js";

interface HSLAColor {
  type: "hsla";
  h: number;
  s: number;
  l: number;
  a?: number;
}

interface RGBAColor {
  type: "rgba";
  r: number;
  g: number;
  b: number;
  a?: number;
}

type TextColor = HSLAColor | RGBAColor;

interface FontSettings {
  size: number;
  family: string;
}

interface TextProperties {
  position: Point;
  color: TextColor;
  textAlign: CanvasTextAlign;
  fontSettings: FontSettings;
}

export class Text extends Component {
  private _color: TextColor = { type: "rgba", r: 0, g: 0, b: 0 };
  private _textAlign: CanvasTextAlign = "left";
  private _fontSettings: FontSettings = { size: 100, family: "Arial" };

  public override getProperties(): TextProperties {
    return dumbDeepCopy({
      position: this.position,
      color: this._color,
      textAlign: this._textAlign,
      fontSettings: this._fontSettings,
    });
  }

  public constructor(
    position: Point,
    effects: Effect[],
    color?: HSLAColor | RGBAColor,
    textAlign?: CanvasTextAlign,
    fontSettings?: FontSettings
  ) {
    super(position, effects);
    if (color !== undefined) this._color = color;
    if (textAlign !== undefined) this._textAlign = textAlign;
    if (fontSettings !== undefined) this._fontSettings = fontSettings;
  }

  public override draw(context: CanvasRenderingContext2D, frame: number, text: string): void {
    const updatedProperties = this.applyEffects(context, frame) as TextProperties;

    context.save();
    context.font = `${updatedProperties.fontSettings.size}px ${updatedProperties.fontSettings.family}`;

    if (updatedProperties.color.type === "hsla") {
      context.fillStyle = `hsl(${
        updatedProperties.color.h //
      }, ${
        updatedProperties.color.s //
      }%, ${
        updatedProperties.color.l //
      }%, ${
        updatedProperties.color.a ?? 1 //
      })`;
    } else if (updatedProperties.color.type === "rgba") {
      context.fillStyle = `rgba(${
        updatedProperties.color.r //
      }, ${
        updatedProperties.color.g //
      }, ${
        updatedProperties.color.b //
      }, ${
        updatedProperties.color.a ?? 1 //
      })`;
    }
    context.textAlign = updatedProperties.textAlign;
    context.fillText(text, updatedProperties.position.x, updatedProperties.position.y);
    context.restore();
  }
}
