import { CanvasRenderingContext2D } from "canvas";
import { Translate } from "../effects/translate.js";
import { Component } from "./component.js";

export class Text extends Component {
  public override getProperties() {
    return {
      position: { ...this.position },
    };
  }

  public override draw(context: CanvasRenderingContext2D, frame: number, text: string): void {
    let properties = this.getProperties();

    for (const effect of this.effects) {
      properties = effect.apply(frame, properties);
    }

    context.save();
    context.font = "100px sans-serif";
    context.fillStyle = "#000000";
    context.textAlign = "center";
    context.fillText(text, properties.position.x, properties.position.y);
    context.restore();
  }
}
