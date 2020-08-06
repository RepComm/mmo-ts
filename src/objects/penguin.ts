
import { Object2D } from "../scene/object.js";
import { Vec2 } from "../math/vec.js";

export class Penguin extends Object2D {
  walkToVec: Vec2 = new Vec2();
  walkFromVec: Vec2 = new Vec2();
  isWalking: boolean = false;
  walkStep: number = 2;
  walkSteps: number = 0;
  walkDist: number = 0;

  constructor () {
    super();
  }

  walkTo (to: Vec2): Penguin {
    this.walkToVec.copy(to);
    this.walkFromVec.copy(this.transform.position);
    this.isWalking = true;
    this.walkSteps = 0;
    this.walkDist = this.walkToVec.distance(this.walkFromVec);
    return this;
  }

  render (ctx: CanvasRenderingContext2D): Penguin {
    if (this.isWalking) {
      this.walkSteps += this.walkStep / this.walkDist;
      if (this.walkSteps > 1) this.isWalking = false;
      this.transform.position.copy(this.walkFromVec).lerp(this.walkToVec, this.walkSteps);
    }
    super.render(ctx);
    return this;
  }
}
