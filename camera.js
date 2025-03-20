// Camera Class: Smoothly follows the player
class Camera {
    constructor(canvas) {
      this.canvas = canvas;
      this.x = 0;
      this.y = 0;
    }
    
    update(target, deltaTime) {
      const targetX = target.x - this.canvas.width/2;
      const targetY = target.y - this.canvas.height/2;
      const smoothing = 4;
      const lerpFactor = 1 - Math.exp(-smoothing * deltaTime);
      this.x = lerp(this.x, targetX, lerpFactor);
      this.y = lerp(this.y, targetY, lerpFactor);
    }
  }
  