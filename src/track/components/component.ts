import { CanvasRenderingContext2D } from "canvas";
import { Point } from "../../utils/interfaces.js";
import { Effect } from "../effects/effect.js";

export abstract class Component {
  protected position: Point = { x: 0, y: 0 };

  protected effects: Effect[];

  constructor(position: Point, effects: Effect[]) {
    this.position.x = position.x;
    this.position.y = position.y;
    this.effects = effects;
  }

  public applyEffects(context: CanvasRenderingContext2D, frame: number) {
    let properties = this.getProperties();

    for (const effect of this.effects) {
      properties = effect.apply(context, frame, properties);
    }

    return properties;
  }

  public abstract draw(context: CanvasRenderingContext2D, frame: number, ...params: any): void;

  public abstract getProperties(): any;
}
