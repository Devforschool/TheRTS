// grave.js

class Grave {
    constructor(x, y, size = 20) {
      this.x = x;
      this.y = y;
      this.size = size;
    }
  
    draw(ctx) {
      ctx.fillStyle = "grey";
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    containsPoint(px, py) {
        return px >= this.x && px <= this.x + this.width &&
               py >= this.y && py <= this.y + this.height;
    }
  }
  