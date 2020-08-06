
import { Transform2d } from "../math/transform.js";
import { GradientDef } from "./scene2d.js";

export class Object2D {
  parent: Object2D;
  transform: Transform2d = new Transform2d();
  children: Set<Object2D>;
  preRenderStarted: boolean;
  postRenderEnded: boolean = true;
  hasChildren(): boolean {
    return this.children && this.children.size > 0;
  }
  has(child: Object2D): boolean {
    return (this.children && this.children.has(child));
  }
  remove(child: Object2D, alertChild: boolean = true): Object2D {
    if (!this.children || !this.children.has(child)) throw "Child was never added";
    if (alertChild && child.hasParent()) {
      child.removeSelf(false);
    }
    return this;
  }
  hasParent(): boolean {
    return this.parent != null && this.parent != undefined;
  }
  removeSelf(alertParent: boolean = true): Object2D {
    if (!this.hasParent()) throw "Cannot remove self, parent is not defined";
    if (alertParent) {
      this.parent.remove(this, false);
    }
    this.parent = undefined;
    return this;
  }
  setParent(parent: Object2D, alertParent: boolean = true): Object2D {
    if (!parent) throw "Parent is not defined";
    if (alertParent) {
      parent.add(this, false);
    }
    return this;
  }
  add(child: Object2D, alertChild: boolean = true): Object2D {
    if (!this.children) this.children = new Set();
    if (this.has(child)) throw "Cannot add child twice";
    if (child.hasParent()) child.removeSelf(true);

    this.children.add(child);
    if (alertChild) {
      child.setParent(this, false);
    }
    return this;
  }
  preRender(ctx: CanvasRenderingContext2D) {
    if (this.preRenderStarted || !this.postRenderEnded) throw "Cannot pre render, previously pre-rendered without post render step";
    this.preRenderStarted = true;
    this.postRenderEnded = false;
    ctx.save();
    ctx.translate(
      this.transform.position.x,
      this.transform.position.y
    );
    ctx.rotate(
      this.transform.rotation
    );
    ctx.scale(
      this.transform.scale,
      this.transform.scale
    );
  }
  postRender(ctx: CanvasRenderingContext2D) {
    if (!this.preRenderStarted || this.postRenderEnded) throw "Cannot post render, previously didn't pre render";
    this.preRenderStarted = false;
    ctx.restore();
    this.postRenderEnded = true;
  }
  renderChildren(ctx: CanvasRenderingContext2D) {
    if (this.children) {
      for (let child of this.children) {
        child.render(ctx);
      }
    }
  }
  render(ctx: CanvasRenderingContext2D): Object2D {
    this.preRender(ctx);

    this.renderChildren(ctx);

    this.postRender(ctx);
    return this;
  }
}

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
  setGradientFill (gradDef: GradientDef): Object2D {
    this.fillGradientDef = gradDef;
    if (this.fillGradientDef) {
      this.needsFillGradientCompile = true;
    } else {
      this.needsFillGradientCompile = false;
    }
    return this;
  }
  setGradientStroke (gradDef: GradientDef): Object2D {
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

    this.renderChildren(ctx);

    this.postRender(ctx);
    return this;
  }
}
