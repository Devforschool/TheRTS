// Chest Class: A chest that gives extra blocks when opened
class Chest {
    constructor(x, y, width, height, blockReward) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.blockReward = blockReward;
    }
    
    draw(ctx) {
      ctx.fillStyle = "sienna";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = "brown";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    
    containsPoint(px, py) {
      return px >= this.x && px <= this.x + this.width &&
             py >= this.y && py <= this.y + this.height;
    }
  }
  