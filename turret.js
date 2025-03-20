class Turret {
    constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.claimed = true;
      this.fireRate = 0.75; // seconds between shots
      this.bulletDamage = 10; // damage per second
      this.upgradeLevel = 0;
      this.purchaseCost = 20;
      this.upgradeCost = 37; // initial upgrade cost (in blocks)
      this.target = null;
      this.currentRotation = 0;
      this.game = null;
      this.timeSinceRetarget = 0;
      this.timeSinceLastShot = 0;
      this.retargetingTime = 0.2;
      this.bulletSpeed = 100;
  
      // Health properties.
      this.baseHealth = 60;       // initial health.
      this.health = this.baseHealth; // current health.
      this.maxHealth = this.baseHealth;
      this.healthIncreasePerUpgrade = 5; // health increases by 20 with each upgrade.
    }
    
    damage(amount) {
      if (!this.game) return;
      
      if (this.health > 0) {
        this.health-= amount * 5;
        if (this.health <= 0) {
        
          this.game.placedTurrets = this.game.placedTurrets.filter(turret => turret !== this);
        }
      }
    }

    // Upgrade the turret if the player has enough blocks.
    upgrade(player) {
      if (player.blockCount >= this.upgradeCost) {
        
        console.log("upgrading turret")
        
        player.blockCount -= this.upgradeCost;
        this.upgradeLevel++;
        this.fireRate *= 0.85;
        this.bulletDamage *= 1.15;
        this.bulletSpeed += 25;
        this.upgradeCost = Math.floor(this.upgradeCost * 2.5);
        // Increase health on upgrade.
        this.maxHealth += this.healthIncreasePerUpgrade;
        this.health = this.maxHealth; // Fully restore health upon upgrade.
      }
    }
    
    update(deltaTime) {
      if (!this.game) return;
      if (this.claimed) {
        this.timeSinceRetarget += deltaTime;
        if (this.timeSinceRetarget >= this.retargetingTime) {
          this.findTarget();
          this.timeSinceRetarget = 0;
        }
      }

      if (this.target) {
        this.timeSinceLastShot += deltaTime;
        if (this.timeSinceLastShot >= this.fireRate) {
          
          this.game.shootBullet(this.currentRotation, this.bulletSpeed, this.bulletDamage,this.x + this.width / 2,this.y + this.height / 2,this.width,this.height)
          this.timeSinceLastShot = 0;
        }
      }
    }
  
    
    findTarget() {
      let closestDistance = Infinity;
      let closestEnemy = null;
      
      for (const enemy of this.game.zombies) {
        const dx = enemy.x - this.x - this.width / 2;
        const dy = enemy.y - this.y - this.height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestEnemy = enemy;
        }
      }
      
      this.target = closestEnemy;
    }
    
    // Draw the turret along with a health bar if claimed.
    draw(ctx) {
      // Draw turret.
      ctx.fillStyle = "darkgrey";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = "black";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      
      
        // Draw a health bar above the turret.
        const barWidth = this.width;
        const barHeight = 5;
        const healthPercentage = this.health / this.maxHealth;
        
        // Background of the health bar (red).
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y - barHeight - 2, barWidth, barHeight);
        
        // Current health (green).
        ctx.fillStyle = "green";
        ctx.fillRect(this.x, this.y - barHeight - 2, barWidth * healthPercentage, barHeight);
        
        // Turret details.
        ctx.fillStyle = "black";
        ctx.font = "10px sans-serif";
        ctx.fillText("Lv " + this.upgradeLevel, this.x + 2, this.y + 10);
        ctx.fillText("Fire Rate: " + this.fireRate.toFixed(2), this.x + 2, this.y + 20);
        ctx.fillText("Cost: " + this.upgradeCost, this.x + 2, this.y + 30);

        // calculate the turret gun roation (2d)
        if (this.target) {
          const dx = this.target.x - this.x - this.width / 2;
          const dy = this.target.y - this.y - this.height / 2;
          this.currentRotation = Math.atan2(dy, dx);
        }

        // draw the turret gun
        ctx.fillStyle = "black";
        
        // Draw the turret gun if a target exists.

        
          ctx.save();
          // Translate to the center of the turret.
          const centerX = this.x + this.width / 2;
          const centerY = this.y + this.height / 2;
          ctx.translate(centerX, centerY);
          // Rotate to point towards the target.
          ctx.rotate(this.currentRotation);
          // Draw the gun: a rectangle extending from the center.
          // The rectangle's length and width can be adjusted as needed.
          ctx.fillStyle = "darkgrey"; // Same as the turret's body.
          ctx.fillRect(0, -2, this.width, 4); // Gun from the center outwards.
          ctx.restore();
        
    }
    
    containsPoint(px, py) {
      return px >= this.x && px <= this.x + this.width &&
             py >= this.y && py <= this.y + this.height;
    }
  }
  