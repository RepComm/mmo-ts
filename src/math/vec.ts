
export class Vec2 {
  x: number = 0;
  y: number = 0;
  constructor () {

  }
  set(x: number, y: number): Vec2 {
    this.x = x;
    this.y = y;
    return this;
  }
}
