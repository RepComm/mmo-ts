
import { Object2D } from "./object2d.js";

export interface GradientStopDef {
  color: string;
}

export class GradientDef {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  copyFrom?: string
  stops: Map<number, GradientStopDef> = new Map();
  constructor () {

  }
  setStop (offset: number, stopDef: GradientStopDef) {
    this.stops.set(offset, stopDef);
  }
  compiled: CanvasGradient;
  compile (ctx: CanvasRenderingContext2D) {
    this.compiled = ctx.createLinearGradient(
      this.x1, this.y1,
      this.x2, this.y2
    );
    this.stops.forEach((def, offset)=>{
      this.compiled.addColorStop(
        offset, def.color
      )
    });
  }
}

export class Scene2D extends Object2D {
  gradients: Map<string, GradientDef> = new Map();
  constructor () {
    super();
  }
  setGradient(id: string, def: GradientDef): Scene2D {
    this.gradients.set(id, def);
    return this;
  }
}
