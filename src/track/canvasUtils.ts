import { CanvasRenderingContext2D } from "canvas";
import { Point, Size } from "../utils/interfaces.js";

export class CanvasUtils {
  public static drawRectangle(context: CanvasRenderingContext2D, position: Point, size: Size, color: string): void {
    context.save();
    context.fillStyle = color;
    context.beginPath();
    context.rect(position.x, position.y, size.width, size.height);
    context.fill();
    context.closePath();
    context.restore();
  }

  public static drawRectangleBorder(
    context: CanvasRenderingContext2D,
    position: Point,
    size: Size,
    color: string
  ): void {
    context.save();
    context.strokeStyle = color;
    context.beginPath();
    context.rect(position.x, position.y, size.width, size.height);
    context.stroke();
    context.closePath();
    context.restore();
  }
}
