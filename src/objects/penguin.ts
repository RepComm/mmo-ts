
import { Object2D } from "../scene/object.js";
import { Vec2 } from "../math/vec.js";
import { SceneResource } from "../resource.js";
import { PathObject2D } from "../scene/pathobject.js";

export class Penguin extends Object2D {
  walkToVec: Vec2 = new Vec2();
  walkFromVec: Vec2 = new Vec2();
  isWalking: boolean = false;
  walkStep: number = 2;
  walkSteps: number = 0;
  walkDist: number = 0;

  animFrameInterval: number = 160;
  animFrameCounter: number = 0;

  static displayRes: SceneResource;
  display: PathObject2D = new PathObject2D();

  walkFwdFrames: Array<Object2D>;
  currentFrameIndex: number = 0;
  currentFrame: Object2D;

  constructor() {
    super();
    let peng = Penguin.displayRes
      .scene
      .getChildByLabel("layer1")
      .getChildByLabel("penguin");

    this.walkFwdFrames = new Array();
    this.walkFwdFrames.push(
      peng.getChildByLabel("fwd0"),
      peng.getChildByLabel("fwd1"),
      peng.getChildByLabel("fwd2"),
      peng.getChildByLabel("fwd1")
    );

    this.nextFrame();
  }

  setDisplay(frame: Object2D): Penguin {
    if (this.children) {
      this.children.forEach((parent, child) => {
        this.remove(child);
      });
    }
    if (frame) {
      this.currentFrame = frame;
      this.add(frame);
    }
    return this;
  }

  nextFrame(): Penguin {
    this.currentFrameIndex++;
    if (this.currentFrameIndex > this.walkFwdFrames.length - 1) {
      this.currentFrameIndex = 0;
    }
    this.currentFrame = this.walkFwdFrames[this.currentFrameIndex];
    this.setDisplay(this.currentFrame);
    return this;
  }

  walkTo(to: Vec2): Penguin {
    this.walkToVec.copy(to);
    this.walkFromVec.copy(this.transform.position);
    this.isWalking = true;
    this.walkSteps = 0;
    this.walkDist = this.walkToVec.distance(this.walkFromVec);
    return this;
  }

  render(ctx: CanvasRenderingContext2D): Penguin {
    if (this.isWalking) {
      this.walkSteps += this.walkStep / this.walkDist;
      if (this.walkSteps > 1) this.isWalking = false;
      this.transform.position.copy(this.walkFromVec).lerp(this.walkToVec, this.walkSteps);

      this.animFrameCounter += 1000 / 30;
      if (this.animFrameCounter > this.animFrameInterval) {
        this.animFrameCounter = 0;
        this.nextFrame();
      }
    }
    super.render(ctx);
    return this;
  }

  static async initResources() {
    Penguin.displayRes = await SceneResource.load("./objects/penguin-all-sheet.svg");
    // Penguin.displayRes.scene.transform.position.set(0, 0);
    // Penguin.displayRes.scene.traverse((child)=>{
    //   console.log("Setting", child.label, "position to 0 0", child.transform.position);
    //   child.transform.position.set(0,0);
    // });
  }
}
