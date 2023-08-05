import { CanvasRenderingContext2D } from "canvas";
import { Point } from "../../utils/interfaces.js";
import { Effect } from "../effects/effect.js";
import { dumbDeepCopy } from "../../utils/utils.js";

export interface ComponentProperties {
  position: Point;
  display: boolean;
}
export abstract class Component {
  protected position: Point = { x: 0, y: 0 };
  protected display = true;

  protected effects: Effect[];
  protected subComponents: Map<string, Component> = new Map();

  constructor(position: Point, effects: Effect[]) {
    this.position.x = position.x;
    this.position.y = position.y;
    this.effects = effects;
  }

  public getProperties(): ComponentProperties {
    return dumbDeepCopy({
      position: this.position,
      display: this.display,
    });
  }

  public applyEffects(context: CanvasRenderingContext2D, frame: number) {
    let properties = this.getProperties();

    for (const effect of this.effects) {
      properties = effect.apply(context, frame, properties);
    }

    return properties;
  }

  public draw(context: CanvasRenderingContext2D, frame: number, ...params: any) {
    const updatedProperties = this.applyEffects(context, frame);

    context.save();

    if (updatedProperties.display) {
      this.drawComponent(context, frame, updatedProperties, ...params);

      context.translate(updatedProperties.position.x, updatedProperties.position.y);

      for (const subComponent of this.subComponents.values()) {
        subComponent.draw(context, frame);
      }
    }

    context.restore();
  }

  protected getSubComponent<T extends Component>(name: string): T {
    return this.subComponents.get(name) as T;
  }

  protected abstract drawComponent(
    context: CanvasRenderingContext2D,
    frame: number,
    updatedProperties: any,
    ...params: any
  ): void;

  public setPosition(position: Point) {
    this.position.x = position.x;
    this.position.y = position.y;
  }
}
