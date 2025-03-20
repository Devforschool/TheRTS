class Zombie {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    // Set size based on options or default values.
    this.width = options.width || 20;
    this.height = options.height || 20;
    // Movement speed (pixels per frame).
    this.speed = options.speed || 15;
    // Health and maximum health.
    this.health = options.health || 40;
    this.maxHealth = options.health || 100;
    // Damage dealt to blocks per attack.
    this.attackPower = options.attackPower || 1;
    // Distance threshold (in pixels) within which blocks are damaged.
    this.attackRadius = options.attackRadius || 45;
    // Visual representation.
    this.color = options.color || "green";
    // Reference to a navmesh instance for pathfinding.
    this.navMesh = options.navMesh || null;
    // Current target and path.
    this.target = null;
    this.oldTargetPosValid = false;
    this.oldTargetPos = null;
    this.path = [];
    // Timer to control how often nearby blocks are damaged.
    this.damageTimer = 0;
    this.damageInterval = options.damageInterval || 1.75; // in seconds
  }

  // Set a new target; recalc path if target changes.
  setTarget() {
    if (!this.game || !this.game.farms || !this.game.player) return;
    
    let entities = [
      ...(this.game.farms ? this.game.farms.filter(farm => farm.claimed) : []),
      this.game.player ? [this.game.player] : [],
      ...(this.game.placedTurrets  || [])
    ].flat();
    
    let closestTarget = null;
    let minDistance = Infinity;
  
    for (let entity of entities) {
      if (!entity) continue;
      let distance = Math.hypot(this.x - entity.x, this.y - entity.y);
      if (distance < minDistance) {
        minDistance = distance;
        closestTarget = entity;
      }
    }
  
    this.target = closestTarget;
    
    if (this.navMesh && this.target) {
      this.path = this.navMesh.findPath(this.x, this.y, this.target.x, this.target.y);
    }
  }
  
  calculateCols(originalX, originalY) {
    if (this.game.checkPlacedBlocksCollision(this)) {
      this.x = originalX;
    }
    if (this.game.checkPlacedBlocksCollision(this)) {
      this.y = originalY;
    }
  }

  // Damage nearby blocks based on distance.
  damageNearbyEntities() {
    if (!this.game) return;
    
    let entities = [
      ...(this.game.placedBlocks || []),
      ...(this.game.farms ? this.game.farms.filter(farm => farm.claimed) : []),
      this.game.player ? [this.game.player] : [],
      ...(this.game.placedTurrets  || [])
    ].flat();
    
    entities.forEach(entity => {
      // Compute the center of the entity.
      const entityCenterX = entity.x + (entity.width || 0) / 2;
      const entityCenterY = entity.y + (entity.height || 0) / 2;
      // Compute the distance between this entity and the target entity.
      const dx = entityCenterX - this.x;
      const dy = entityCenterY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= this.attackRadius && typeof entity.damage === 'function') {
        entity.damage(this.attackPower);
      }
    });
  }

  damage(amount) {
    if (this.health > 0) {
      this.health -= amount;
      if (this.health <= 0) {
        // remove it from game.zombies
        this.game.zombies = this.game.zombies.filter(zombie => zombie !== this);
      }
    }
  }

  // Call this function every frame to update zombie position.
  move(dt) {
    const originalX = this.x;
    const originalY = this.y;

    if (!this.game) return;
    if (this.path && this.path.length > 0) {
      // Get the next node in the path.
      let nodeI = (this.path.length === 1) ? 0 : 1;
      const node = this.path[nodeI];
      // Calculate the center of the grid cell.
      const nodeX = node.col * this.navMesh.tileSize + this.navMesh.tileSize / 2;
      const nodeY = node.row * this.navMesh.tileSize + this.navMesh.tileSize / 2;
      // Compute direction to the node.
      const dx = nodeX - this.x;
      const dy = nodeY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < (this.speed * dt)) {
        // Snap to the node and remove it from the path.
        if (nodeX != this.x || nodeY != this.y) {
          this.x = nodeX;
          this.y = nodeY;
          this.calculateCols(originalX, originalY);
          this.path.shift();
        }
      } else {
        // Normalize and move.
        if (distance !== 0) {
          this.x += (dx / distance) * this.speed * dt;
          this.y += (dy / distance) * this.speed * dt;
        }
      
        this.calculateCols(originalX, originalY);
      }
    }
    
    // Update damage timer and damage nearby blocks if enough time has passed.
    this.damageTimer += dt;
    if (this.damageTimer >= this.damageInterval) {
      this.damageNearbyEntities();
      this.damageTimer = 0;
    }
    
    // Continue pathfinding if needed.
    this.setTarget(this.target);
  }

  // Render the zombie and its health bar.
  render(ctx) {
    // Draw zombie as a rectangle.
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    // Draw health bar above zombie.
    const barWidth = this.width;
    const barHeight = 5;
    const healthRatio = this.health / this.maxHealth;
    // Draw the background of the health bar.
    ctx.fillStyle = "red";
    ctx.fillRect(
      this.x - barWidth / 2,
      this.y - this.height / 2 - barHeight - 2,
      barWidth,
      barHeight
    );
    // Draw the current health.
    ctx.fillStyle = "green";
    ctx.fillRect(
      this.x - barWidth / 2,
      this.y - this.height / 2 - barHeight - 2,
      barWidth * healthRatio,
      barHeight
    );
  }
}
