// bullets.js

class FiredBullet{
  /**
   * @param {number} x - Starting x position of the bullet.
   * @param {number} y - Starting y position of the bullet.
   * @param {number} angle - The angle (in radians) that the bullet travels.
   * @param {number} speed - How fast the bullet moves (pixels per second).
   * @param {number} damage - The amount of damage the bullet deals on impact.
   * @param {Object} game - Reference to the game object (should contain enemy list, width, height, etc.).
   */
  constructor(x, y, angle, speed, damage, game) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed || 100;
    this.damage = damage;
    this.game = game;
    this.radius = 3; // Bullet radius for collision detection
    this.active = true;
    this.despawnTime = 5; // Time in seconds before the bullet despawns
    this.elapsedTime = 0; // Track time since bullet was fired

    // Calculate velocity components based on the radian angle
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  /**
   * Updates the bullet's position and checks for collisions.
   * @param {number} deltaTime - The time elapsed since the last update (in seconds).
   */
  update(deltaTime) {
    if (!this.active) return;

    if (typeof deltaTime !== 'number' || isNaN(deltaTime)) {
      console.error("Invalid deltaTime:", deltaTime);
      return;
    }

    // Update bullet position
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Increase elapsed time and check despawn condition
    this.elapsedTime += deltaTime;
    if (this.elapsedTime >= this.despawnTime) {
      this.active = false;
      return;
    }

    // Check collision with each enemy in the game.
    for (const enemy of this.game.zombies) {
      if (
        this.x > enemy.x - enemy.width / 2 &&
        this.x < enemy.x + enemy.width / 2 &&
        this.y > enemy.y - enemy.height / 2 &&
        this.y < enemy.y + enemy.height / 2
      ) {
        enemy.damage(this.damage);
        console.log("Bullet hit an enemy!");
        this.game.bullets = this.game.bullets.filter(bullet => bullet !== this);
        break;
      }
    }

    // Remove the bullet if it goes off-screen.
    if (
      this.x < 0 ||
      this.x > this.game.width ||
      this.y < 0 ||
      this.y > this.game.height
    ) {
      this.active = false;
    }
  }

  /**
   * Draws the bullet on the canvas.
   * @param {CanvasRenderingContext2D} ctx - The canvas context.
   */
  draw(ctx) {
    if (!this.active) return;
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
