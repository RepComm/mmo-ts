
import { Object2D } from "./object2d.js";

export interface GradientStopDef {
  color: string;
}

function pxToMm (px: number, dpi: number): number {
  return ( px * 25.4 ) / dpi;
}

function mmToPx (mm: number, dpi: number): number {
  return (mm / 25.4) * dpi;
}

//I don't know why, but this decimal was needed to make it work
function transformCoordinate (c: number): number {
  // return c * 3.788225;
  return c;
}

export class GradientDef {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  copyFrom?: string;
  stops: Map<number, GradientStopDef> = new Map();
  constructor () {

  }
  setStop (offset: number, stopDef: GradientStopDef) {
    this.stops.set(offset, stopDef);
  }
  compiled: CanvasGradient;
  compile (ctx: CanvasRenderingContext2D) {
    this.x1 = transformCoordinate(this.x1);
    this.y1 = transformCoordinate(this.y1);
    this.x2 = transformCoordinate(this.x2);
    this.y2 = transformCoordinate(this.y2);

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
  width: number;
  height: number;
  constructor () {
    super();
  }
  setGradient(id: string, def: GradientDef): Scene2D {
    this.gradients.set(id, def);
    return this;
  }
}
