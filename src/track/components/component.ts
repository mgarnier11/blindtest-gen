import { CanvasRenderingContext2D } from "canvas";
import { Point } from "../../utils/interfaces.js";
import { Effect } from "../effects/effect.js";
import { AllPaths, dumbDeepCopy, generateId, getPropertyValue, setPropertyValue } from "../../utils/utils.js";
import { Color } from "../canvasUtils.js";
import { Rectangle } from "./rectangle.js";
import { RectangleBorder } from "./rectangleBorder.js";
import { ProgressBar } from "./progressBar.js";
import { Text } from "./text.js";

export enum ComponentType {
  Unknown = "unknown",
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
  public static typeToClass: any = undefined;
  public static async setTypeToClass() {
    Component.typeToClass = {
      [ComponentType.Rectangle]: (await import("./rectangle.js")).Rectangle,
      [ComponentType.RectangleBorder]: (await import("./rectangleBorder.js")).RectangleBorder,
      [ComponentType.Text]: (await import("./text.js")).Text,
      [ComponentType.ProgressBar]: (await import("./progressBar.js")).ProgressBar,
    };
  }

  public static defaultComponentProperties: ComponentProperties = {
    position: { x: 0, y: 0 },
    display: true,
    color: { type: "rgba", r: 0, g: 0, b: 0 },
    opacity: 1,
  };
  public static Builder = class {
    protected builderProperties: ComponentProperties = dumbDeepCopy(Component.defaultComponentProperties);
    protected effects: Effect[] = [];

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

    protected buildComponent<T extends Component>(type: ComponentType): T {
      const ComponentClass = Component.typeToClass[type];

      if (!ComponentClass) {
        throw new Error(`Unknown component type: ${type}`);
      }

      const component = new ComponentClass() as Component;

      component.setProperties(this.builderProperties);
      component.effects = this.effects;

      return component as T;
    }
  };

  protected id: string = generateId();
  public getId = (): string => this.id;

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
      id: this.id,
    };
  }

  public static fromJSON<T extends Component>(json: any): T {
    const ComponentClass = Component.typeToClass[json.type as ComponentType];

    if (!ComponentClass) {
      throw new Error(`Unknown component type: ${json.type}`);
    }

    const component = new ComponentClass() as Component;

    component.id = json.id;
    component.setProperties(json.properties);
    component.effects = json.effects.map((effect: any) => Effect.fromJSON(effect));
    component.subComponents = new Map(
      Object.entries(json.subComponents).map(([name, subComponent]: [string, any]) => [
        name,
        Component.fromJSON(subComponent),
      ])
    );

    component.setJSONProperties(json);

    return component as T;
  }

  protected setJSONProperties(json: any): void {}

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

    for (const effect of this.effects.values()) {
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

  public getEffect<T extends Effect>(id: string): T {
    return this.effects.find((effect) => effect.getId() === id) as T;
  }

  protected abstract drawComponent(
    context: CanvasRenderingContext2D,
    frame: number,
    updatedProperties: any,
    ...params: any
  ): void;
}

export const registerComponents = async () => {
  await Component.setTypeToClass();
};
