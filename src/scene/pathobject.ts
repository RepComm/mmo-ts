
import { Object2D } from "./object.js";
import { GradientDef } from "./scene2d.js";

export class PathObject2D extends Object2D {
  path: Path2D;
  fillStyle: string | CanvasGradient | CanvasPattern = "white";
  strokeStyle: string | CanvasGradient | CanvasPattern = "white";
  lineWidth: number = 1;
  doStroke: boolean = true;
  doFill: boolean = true;
  fillGradientDef: GradientDef;
  needsFillGradientCompile: boolean = false;
  strokeGradientDef: GradientDef;
  needsStrokeGradientCompile: boolean = false;
  constructor() {
    super();
  }
  enableStroke(enable: boolean = true): PathObject2D {
    this.doStroke = enable;
    return this;
  }
  enableFill(enable: boolean = true): PathObject2D {
    this.doFill = enable;
    return this;
  }
  setPath(path: Path2D): PathObject2D {
    this.path = path;
    return this;
  }
  getPath(): Path2D {
    return this.path;
  }
  hasPath(): boolean {
    return this.path != null && this.path != undefined;
  }
  setGradientFill(gradDef: GradientDef): Object2D {
    this.fillGradientDef = gradDef;
    if (this.fillGradientDef) {
      this.needsFillGradientCompile = true;
    } else {
      this.needsFillGradientCompile = false;
    }
    return this;
  }
  setGradientStroke(gradDef: GradientDef): Object2D {
    this.strokeGradientDef = gradDef;
    if (this.strokeGradientDef) {
      this.needsStrokeGradientCompile = true;
    } else {
      this.needsStrokeGradientCompile = false;
    }
    return this;
  }
  render(ctx: CanvasRenderingContext2D): Object2D {
    this.preRender(ctx);

    if (this.path) {
      ctx.lineWidth = this.lineWidth / this.transform.scale;

      if (this.doFill) {
        if (this.needsFillGradientCompile) {
          this.needsFillGradientCompile = false;
          this.fillGradientDef.compile(ctx);
          this.fillStyle = this.fillGradientDef.compiled;
        }
        ctx.fillStyle = this.fillStyle;
        ctx.fill(this.path);
      }
      if (this.doStroke) {
        if (this.needsStrokeGradientCompile) {
          this.needsStrokeGradientCompile = false;
          this.strokeGradientDef.compile(ctx);
          this.strokeStyle = this.strokeGradientDef.compiled;
        }
        ctx.strokeStyle = this.strokeStyle;
        ctx.stroke(this.path);
      }
    } else {
      console.warn("No path to render");
    }

    this.renderChildren(ctx);

    this.postRender(ctx);
    return this;
  }
}

