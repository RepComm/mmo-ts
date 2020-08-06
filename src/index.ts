
import { get } from "./ui/aliases.js";
import { Renderer } from "./ui/renderer.js";
import { GameInput } from "./input/gameinput.js";
import { SceneResource } from "./resource.js";
import { Vec2 } from "./math/vec.js";
import { Penguin } from "./objects/penguin.js";

async function init() {
  let sceneRes = await SceneResource.load("./scenes/plaza.svg");
  
  const scene = sceneRes.scene;

  const canvas = get("canvas") as HTMLCanvasElement;
  const renderer = new Renderer({
    premadeCanvas: canvas
  }).setScene(scene).handleResize().start();

  const penguinRes = await SceneResource.load("./objects/penguin.svg");
  const penguin = new Penguin();
  penguinRes.scene.transform.position.set(-8, -14);
  penguin.add(penguinRes.scene);
  penguin.transform.position.set(100, 100);

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

  const pointerVec = new Vec2();

  renderer.addRenderListener((ctx, delta) => {
    drawFpsCounter(ctx);

    pointerVec.set(
      input.pointerScreenX,
      input.pointerScreenY
    );

    if (input.pointerPrimary) {
      penguin.walkTo(pointerVec);
    }
  });
}

init();
