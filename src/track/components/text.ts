import { CanvasRenderingContext2D } from "canvas";
import { Component, ComponentProperties } from "./component.js";
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

type TextProperties = ComponentProperties & {
  color: TextColor;
  textAlign: CanvasTextAlign;
  fontSettings: FontSettings;
};

export class Text extends Component {
  private _color: TextColor = { type: "rgba", r: 0, g: 0, b: 0 };
  private _textAlign: CanvasTextAlign = "left";
  private _fontSettings: FontSettings = { size: 100, family: "Arial" };

  private _text: string = "";

  public override getProperties(): TextProperties {
    return dumbDeepCopy({
      ...super.getProperties(),
      color: this._color,
      textAlign: this._textAlign,
      fontSettings: this._fontSettings,
    });
  }

  public constructor(
    position: Point,
    effects: Effect[],
    text?: string,
    color?: HSLAColor | RGBAColor,
    textAlign?: CanvasTextAlign,
    fontSettings?: FontSettings
  ) {
    super(position, effects);
    if (text !== undefined) this._text = text;
    if (color !== undefined) this._color = color;
    if (textAlign !== undefined) this._textAlign = textAlign;
    if (fontSettings !== undefined) this._fontSettings = fontSettings;
  }

  public setText(text: string) {
    this._text = text;
  }

  public override drawComponent(
    context: CanvasRenderingContext2D,
    frame: number,
    updatedProperties: TextProperties,
    text?: string
  ) {
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

    context.fillText(text ? text : this._text, updatedProperties.position.x, updatedProperties.position.y);
  }
}
