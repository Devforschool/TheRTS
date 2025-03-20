// Block.js
class Block {
    constructor(x, y, size, durability = 1) {
      this.x = x;
      this.y = y;
      this.width = size;
      this.height = size;
      this.durability = durability;
    }

    damage() {
      if (!this.game) return;
      if (this.durability > 0) {
        this.durability--;
        if (this.durability === 0) {
          // remove it from game.placedBlocks
          this.game.placedBlocks = this.game.placedBlocks.filter(block => block !== this);
        }
      }
    }
  
    draw(ctx) {
      ctx.fillStyle = "#444";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = "#222";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = "white";
      ctx.font = "10px sans-serif";
      ctx.fillText(this.durability, this.x + 2, this.y + 10);
    }
  
    containsPoint(x, y) {
      return (x >= this.x && x <= this.x + this.width &&
              y >= this.y && y <= this.y + this.height);
    }
  }
  