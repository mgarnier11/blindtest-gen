import { CanvasRenderingContext2D } from "canvas";
import { Point } from "../../utils/interfaces.js";
import { Effect } from "../effects/effect.js";
import { AllPaths, dumbDeepCopy, getPropertyValue, setPropertyValue } from "../../utils/utils.js";
import { Color } from "../canvasUtils.js";

export enum ComponentType {
  Unknown = "Unknown",
  Rectangle = "rectangle",
  RectangleBorder = "rectangleBorder",
  Text = "text",
  ProgressBar = "progressBar",
}

export interface ComponentProperties {
  position: Point;
  display: boolean;
  color: Color;
  opacity: number;
}

export abstract class Component {
  public static defaultComponentProperties: ComponentProperties = {
    position: { x: 0, y: 0 },
    display: true,
    color: { type: "rgba", r: 0, g: 0, b: 0 },
    opacity: 1,
  };
  public static Builder = class {
    protected builderProperties: ComponentProperties = dumbDeepCopy(Component.defaultComponentProperties);
    protected effects: Effect[] = [];

    public constructor() {}

    protected setProperty<T>(propertyPath: keyof T, value: any): this {
      if (typeof value === "object") {
        (this.builderProperties as any)[propertyPath] = dumbDeepCopy(value);
      } else {
        (this.builderProperties as any)[propertyPath] = value;
      }

      return this;
    }

    public withPosition = (position: Point): this => this.setProperty<ComponentProperties>("position", position);
    public withDisplay = (display: boolean): this => this.setProperty<ComponentProperties>("display", display);
    public withColor = (color: Color): this => this.setProperty<ComponentProperties>("color", color);
    public withOpacity = (opacity: number): this => this.setProperty<ComponentProperties>("opacity", opacity);
    public withEffects = (effects: Effect[]): this => {
      this.effects = effects;
      return this;
    };
  };

  protected type: ComponentType = ComponentType.Unknown;
  protected effects: Effect[] = [];
  protected subComponents: Map<string, Component> = new Map();

  protected properties: ComponentProperties = dumbDeepCopy(Component.defaultComponentProperties);

  public toJSON(): any {
    const subComponents = Object.fromEntries(
      Array.from(this.subComponents.entries()).map(([name, component]) => [name, component.toJSON()])
    );

    const effects = this.effects.map((effect) => effect.toJSON());

    return {
      type: this.type,
      properties: this.getProperties(),
      effects: effects,
      subComponents: subComponents,
    };
  }

  protected setProperties(properties: ComponentProperties) {
    this.properties = dumbDeepCopy(properties);
  }

  public getProperties(): ComponentProperties {
    return dumbDeepCopy(this.properties);
  }

  protected setProperty<T>(propertyPath: AllPaths<T>, value: any) {
    return setPropertyValue(this.properties, propertyPath, value);
  }

  public applyEffects(context: CanvasRenderingContext2D, frame: number) {
    let properties = this.getProperties();

    for (const effect of this.effects) {
      properties = effect.apply(context, frame, properties);
    }

    return properties;
  }

  public draw(context: CanvasRenderingContext2D, frame: number, ...params: any) {
    context.save();

    const updatedProperties = this.applyEffects(context, frame);

    if (updatedProperties.display) {
      context.globalAlpha = updatedProperties.opacity;

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
}
