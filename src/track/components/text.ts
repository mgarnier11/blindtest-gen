import { CanvasRenderingContext2D } from "canvas";
import { Component, ComponentProperties, ComponentType } from "./component.js";
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

const defaultTextProperties: TextProperties = {
  ...dumbDeepCopy(Component.defaultComponentProperties),
  textAlign: "left",
  fontSettings: { size: 100, family: "Arial" },
  text: "",
};

export class Text extends Component {
  public static Builder = class extends Component.Builder {
    builderProperties: TextProperties = dumbDeepCopy(defaultTextProperties);

    public withTextAlign = (textAlign: CanvasTextAlign): this =>
      this.setProperty<TextProperties>("textAlign", textAlign);
    public withFontSettings = (fontSettings: FontSettings): this =>
      this.setProperty<TextProperties>("fontSettings", fontSettings);
    public withText = (text: string): this => this.setProperty<TextProperties>("text", text);

    public build = (): Text => super.buildComponent(ComponentType.Text);
  };

  protected type = ComponentType.Text;
  protected override properties: TextProperties = dumbDeepCopy(defaultTextProperties);

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

    context.fillText(text ? text : updatedProperties.text, updatedProperties.position.x, updatedProperties.position.y);
  }

  public override setProperty<TextProperties>(propertyPath: AllPaths<TextProperties>, value: any) {
    super.setProperty(propertyPath, value);
  }
}
