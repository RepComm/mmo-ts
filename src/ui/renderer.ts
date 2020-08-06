
import { on } from "./aliases.js";
import Component from "./component.js";
import { Scene2D } from "../scene/scene2d.js";

interface RendererConstructorOptions {
  premadeCanvas: HTMLCanvasElement
}

export interface RenderListener {
  (ctx: CanvasRenderingContext2D, deltaTime: number):void;
}

export interface ResizeListener {
  ():void;
}

export class Renderer extends Component {
  element: HTMLCanvasElement; //Override component's element member
  scene: Scene2D;
  ctx: CanvasRenderingContext2D;
  needsRender: boolean = false;
  renderLoop: boolean = false;
  renderCallback: FrameRequestCallback;
  onResizeCallback: EventListener;
  renderListeners: Set<RenderListener> = new Set<RenderListener>();
  resizeListeners: Set<ResizeListener> = new Set<ResizeListener>();;
  center:{x:0, y:0};
  zoom: number = 1;
  fps: number = 0;
  countedFrames: number = 0;
  lastTime: number = 0;
  nowTime: number = 0;
  deltaTime: number = 0;
  targetFPSCounter: number = 0;
  targetFPS: number = 30;
  targetFrameTime: number = 1000/this.targetFPS;
  secondCounter: number = 0;

  constructor(opts: RendererConstructorOptions | undefined = undefined) {
    super();
    if (opts) {
      if (opts.premadeCanvas) this.useNative(opts.premadeCanvas);
      else this.make("canvas");
    } else {
      this.make("canvas");
    }
    this.init();
    this.renderCallback = () => {
      this.lastTime = this.nowTime;
      this.nowTime = Date.now();
      this.deltaTime = this.nowTime - this.lastTime;
      this.secondCounter += this.deltaTime;
      this.targetFPSCounter += this.deltaTime;

      if (this.targetFPSCounter >= this.targetFrameTime-1) {
        this.targetFPSCounter = 0;
        this.countedFrames++;
        if (this.needsRender) this.render();
      }

      if (this.secondCounter > 1000) {
        this.secondCounter = 0;
        this.fps = this.countedFrames;
        this.countedFrames = 0;
      }
      if (this.renderLoop) requestAnimationFrame(this.renderCallback);
    }
    this.onResizeCallback = () => {
      this.element.width = Math.floor(this.rect.width);
      this.element.height = Math.floor(this.rect.height);
      this.resizeListeners.forEach ((cb)=>{
        cb();
      });
    }
    setTimeout(() => {
      this.onResizeCallback(undefined);
    }, 100);
  }
  init() {
    this.ctx = this.element.getContext("2d");
  }
  setScene(scene: Scene2D): Renderer {
    this.scene = scene;
    return this;
  }
  setSize (width: number, height:number) {
    this.element.width = Math.floor(width);
    this.element.height = Math.floor(height);
  }
  render(): Renderer {
    this.ctx.clearRect(0, 0, this.element.width, this.element.height);
    if (!this.scene) throw "No scene to render!";
    this.scene.render(this.ctx);
    this.renderListeners.forEach((listener)=>{
      listener(this.ctx, this.deltaTime);
    });
    return this;
  }
  start(): Renderer {
    this.renderLoop = true;
    this.needsRender = true;
    requestAnimationFrame(this.renderCallback);
    return this;
  }
  stop(): Renderer {
    this.renderLoop = false;
    this.needsRender = false;
    return this;
  }
  handleResize(): Renderer {
    on(window, "resize", this.onResizeCallback);
    return this;
  }
  addRenderListener (renderer: RenderListener): Renderer {
    if (this.hasRenderListener(renderer)) {
      throw "Cannot add render listener twice";
    }
    this.renderListeners.add(renderer);
    return this;
  }
  hasRenderListener (renderer: RenderListener): boolean {
    return this.renderListeners.has(renderer);
  }
  removeRenderListener (renderer: RenderListener): Renderer {
    if (!this.hasRenderListener(renderer)) {
      throw "Render listener hasn't been added, cannot be removed";
    }
    this.renderListeners.delete(renderer);
    return this;
  }
  removeResizeListener (listener: ResizeListener): Renderer {
    if (!this.hasResizeListener(listener)) throw "Resize listener was never added, cannot remove";
    this.resizeListeners.delete(listener);
    return this;
  }
  hasResizeListener (listener: ResizeListener): boolean {
    return this.resizeListeners.has(listener);
  }
  addResizeListener (listener: ResizeListener): Renderer {
    if (this.hasResizeListener(listener)) {
      throw "Cannot add listener twice";
    }
    this.resizeListeners.add(listener);
    return this;
  }
}
