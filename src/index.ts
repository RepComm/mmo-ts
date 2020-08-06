
import { get } from "./ui/aliases.js";
import { Renderer } from "./ui/renderer.js";
import { PathObject2D } from "./scene/object2d.js";
import { GameInput } from "./input/gameinput.js";
import { radians } from "./math/general.js";
import { SceneResource } from "./resource.js";

async function init() {
  let res = await SceneResource.load("./scenes/plaza.svg");

  const scene = res.scene;
  scene.transform.position.set(100, 100);

  const planetShape = new Path2D();
  planetShape.ellipse(0, 0, 20, 20, 0, 0, radians(360));
  planetShape.moveTo(20, 0);
  planetShape.lineTo(50, 0);

  const sunDemo = new PathObject2D()
    .setPath(planetShape)
    .enableFill(true);
  sunDemo.transform.scale = 2;
  sunDemo.fillStyle = "yellow";

  scene.add(sunDemo);

  const planetDemo = new PathObject2D()
    .setPath(planetShape)
    .enableFill(true);
  planetDemo.transform.scale = 0.2;
  planetDemo.fillStyle = "green";

  sunDemo.add(planetDemo);
  planetDemo.transform.position.x = 150;

  const moonDemo = new PathObject2D()
    .setPath(planetShape)
    .enableFill(true);
  moonDemo.transform.scale = 0.5;
  moonDemo.fillStyle = "grey";

  planetDemo.add(moonDemo);
  moonDemo.transform.position.x = 50;

  const canvas = get("canvas") as HTMLCanvasElement;
  const renderer = new Renderer({
    premadeCanvas: canvas
  }).setScene(scene).handleResize().start();

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

  renderer.addRenderListener((ctx, delta) => {
    drawFpsCounter(ctx);

    sunDemo.transform.rotation += 0.04;
    planetDemo.transform.rotation += 0.01;

    if (input.pointerPrimary) {
      sunDemo.transform.position.set(
        input.pointerScreenX,
        input.pointerScreenY
      );
    }
  });

}

init();
