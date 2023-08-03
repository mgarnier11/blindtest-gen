export abstract class Effect {
  public abstract apply(actualFrame: number, properties: any): any;
}
