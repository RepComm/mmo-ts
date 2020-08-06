
import { get } from "./ui/aliases.js";
import { Renderer } from "./ui/renderer.js";
import { GameInput } from "./input/gameinput.js";
import { SceneResource } from "./resource.js";
import { Vec2 } from "./math/vec.js";

async function init() {
  let sceneRes = await SceneResource.load("./scenes/plaza.svg");
  
  const scene = sceneRes.scene;

  const canvas = get("canvas") as HTMLCanvasElement;
  const renderer = new Renderer({
    premadeCanvas: canvas
  }).setScene(scene).handleResize().start();

  const penguinRes = await SceneResource.load("./objects/penguin.svg");
  const penguin = penguinRes.scene;

  const walkFrom = new Vec2();
  const walkTo = new Vec2();
  let isWalking = false;
  let walkStep = 2;
  let walkSteps = 0;
  let walkDist = 0;

  scene.add(penguin);

  const input = GameInput.get();
  input.setRenderer(renderer);

  const drawFpsCounter = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.fillStyle = "white";
    ctx.fillText(
      `FPS ${renderer.fps} : ${renderer.targetFPS}`,
      20,
      20
    );
    ctx.restore();
  }

  renderer.addResizeListener (()=>{
    scene.transform.scale = renderer.rect.height / (scene.height/3.78);
    renderer.zoom = scene.transform.scale;
  })

  renderer.addRenderListener((ctx, delta) => {
    drawFpsCounter(ctx);

    if (input.pointerPrimary) {
      walkTo.set(
        input.pointerScreenX,
        input.pointerScreenY
      );
      walkFrom.copy(penguin.transform.position);
      isWalking = true;
      walkSteps = 0;
      walkDist = walkTo.distance(walkFrom);
    }

    if (isWalking) {
      walkSteps += walkStep / walkDist;
      if (walkSteps > 1) isWalking = false;
      penguin.transform.position.copy(walkFrom).lerp(walkTo, walkSteps);
    }
  });

}

init();
