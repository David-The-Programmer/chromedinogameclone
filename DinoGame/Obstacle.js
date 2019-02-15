class Obstacle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.velocity;
  }

  draw(img) {
    image(img, this.x, this.y, this.width, this.height);
  }

  move(s) {
    this.velocity = s;
    this.x += this.velocity;
  }

}
