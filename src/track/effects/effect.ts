import { CanvasRenderingContext2D } from "canvas";

export abstract class Effect {
  public abstract apply(context: CanvasRenderingContext2D, actualFrame: number, properties: any): any;
}
