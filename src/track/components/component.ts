import { CanvasRenderingContext2D } from "canvas";
import { Point } from "../../utils/interfaces.js";
import { Effect } from "../effects/effect.js";

export abstract class Component {
  protected position: Point = { x: 0, y: 0 };

  protected effects: Effect[];

  constructor(x: number, y: number, effects: Effect[]) {
    this.position.x = x;
    this.position.y = y;
    this.effects = effects;
  }

  public abstract draw(context: CanvasRenderingContext2D, frame: number, ...params: any): void;

  public abstract getProperties(): any;
}
