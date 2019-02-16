class Obstacle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }

  draw(img) {
    image(img, this.x, this.y, this.width, this.height);
  }

  move(s) {
    this.x += s;
  }

}
