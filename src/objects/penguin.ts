
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

  static displayRes: SceneResource;
  display: PathObject2D = new PathObject2D();
  static fwd0: Object2D;

  constructor () {
    super();
    // this.display.add(Penguin.fwd0);
    console.log(Penguin.fwd0);
    this.add(Penguin.fwd0);
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

  static async initResources () {
    Penguin.displayRes = await SceneResource.load("./objects/penguin-all-sheet.svg");
    // Penguin.displayRes.scene.transform.position.set(0, 0);
    // Penguin.displayRes.scene.traverse((child)=>{
    //   console.log("Setting", child.label, "position to 0 0", child.transform.position);
    //   child.transform.position.set(0,0);
    // });

    let pengroup = Penguin.displayRes.scene.getChildByLabel("layer1").getChildByLabel("penguin");

    Penguin.fwd0 = pengroup.getChildByLabel("fwd0");
  }
}
