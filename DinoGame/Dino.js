class Dino {
  constructor(x, y, w, h, v) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.velocity = v;
  }

  draw(img) {
    image(img, this.x, this.y, this.width, this.height);
  }

  lift(upwardForce) {
    this.velocity += upwardForce;
  }

  fall(downwardForce) {
    this.velocity += downwardForce;
  }
}
