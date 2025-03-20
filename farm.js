class Farm {
    constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.claimed = false;
      this.owner = null;
      this.generationRate = 1; // blocks per second
      this.upgradeLevel = 0;
      this.purchaseCost = 20;
      this.upgradeCost = 15; // initial upgrade cost (in blocks)
      this.accumulated = 0; // for fractional block generation
      this.game = null;
      // Health properties.
      this.baseHealth = 100;       // initial health.
      this.health = this.baseHealth; // current health.
      this.maxHealth = this.baseHealth;
      this.healthIncreasePerUpgrade = 20; // health increases by 20 with each upgrade.
    }

    damage(amount) {
      if (!this.game) return;
      if (this.health > 0) {
        this.health-= amount * 5;
        if (this.health <= 0) {
          // remove it from game.placedBlocks
          this.game.farms = this.game.farms.filter(farm => farm !== this);
        }
      }
    }
    
    // Claim the farm for the player.
    claim(player) {
      if (!this.claimed) {
        if (player.blockCount < this.purchaseCost) {
          return;
        }
        player.blockCount -= this.purchaseCost;
        this.claimed = true;
        this.owner = player;
      }
    }
    
    // Upgrade the farm if the player has enough blocks.
    upgrade(player) {
      if (this.claimed && this.owner === player && player.blockCount >= this.upgradeCost) {
        player.blockCount -= this.upgradeCost;
        this.upgradeLevel++;
        this.generationRate = 1 + this.upgradeLevel;
        this.upgradeCost = Math.floor(this.upgradeCost * 2.5);
        // Increase health on upgrade.
        this.maxHealth += this.healthIncreasePerUpgrade;
        this.health = this.maxHealth; // Fully restore health upon upgrade.
      }
    }
    
    // Update the farm's block generation (adds generated blocks to the player's inventory).
    update(deltaTime, player) {
      if (this.claimed && this.owner === player) {
        this.accumulated += this.generationRate * deltaTime;
        if (this.accumulated >= 1) {
          const addBlocks = Math.floor(this.accumulated);
          player.blockCount += addBlocks;
          this.accumulated -= addBlocks;
        }
      }
    }
    
    // Draw the farm along with a health bar if claimed.
    draw(ctx) {
      // Draw farm.
      ctx.fillStyle = this.claimed ? "lightgreen" : "darkgreen";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = "black";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      
      if (this.claimed) {
        // Draw a health bar above the farm.
        const barWidth = this.width;
        const barHeight = 5;
        const healthPercentage = this.health / this.maxHealth;
        
        // Background of the health bar (red).
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y - barHeight - 2, barWidth, barHeight);
        
        // Current health (green).
        ctx.fillStyle = "green";
        ctx.fillRect(this.x, this.y - barHeight - 2, barWidth * healthPercentage, barHeight);
        
        // Farm details.
        ctx.fillStyle = "black";
        ctx.font = "10px sans-serif";
        ctx.fillText("Lv " + this.upgradeLevel, this.x + 2, this.y + 10);
        ctx.fillText("BPS: " + this.generationRate.toFixed(2), this.x + 2, this.y + 20);
        ctx.fillText("Cost: " + this.upgradeCost, this.x + 2, this.y + 30);
      } else {
        // Unclaimed farm text.
        ctx.fillStyle = "black";
        ctx.font = "10px sans-serif";
        ctx.fillText("Cost: " + this.purchaseCost, this.x + 2, this.y + 30);
      }
    }
    
    containsPoint(px, py) {
      return px >= this.x && px <= this.x + this.width &&
             py >= this.y && py <= this.y + this.height;
    }
  }
  