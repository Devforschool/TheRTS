// Player Class: Holds position, movement, stats, and inventory
class Player {
    constructor(x, y, speed = 200) {
      this.x = x;
      this.y = y;
      this.speed = speed;
      this.width = 20;
      this.height = 20;
      
      // Stats
      this.health = 100;
      this.maxHealth = 100;
      this.stamina = 100;
      this.maxStamina = 100;
      
      // Block inventory and equip status
      this.blockCount = 10;
      this.blocksEquipped = false;
      this.buildingTurret = false;

      this.game = null;
      
      // Sword state:
      // "none"    : Not equipped (invisible)
      // "holding" : Equipped and held (normal offset)
      // "using"   : Actively using the sword (thrusted toward mouse)
      this.swordState = "none";
      
      // Sword offset settings (for drawing a line from the player's center)
      this.holdDistance = 30;
      this.useDistance = 60;
      this.swordOffset = { x: 0, y: 0 };
      this.swordOffsetVelocity = { x: 0, y: 0 };
      this.swordAngle = 0;
    }
    
    // Toggle sword equip/unequip (Q key)
    toggleSword() {
      if (this.swordState === "none") {
        this.blocksEquipped = false;
        this.buildingTurret = false;
        this.swordState = "holding";
        this.swordOffset = { x: 0, y: 0 };
        this.swordOffsetVelocity = { x: 0, y: 0 };
      } else {
        this.swordState = "none";
        this.swordOffset = { x: 0, y: 0 };
        this.swordOffsetVelocity = { x: 0, y: 0 };
      }
    }

    damage(amount) {
      if (this.health > 0) {
        this.health-=(amount * 10);
        if (this.health <= 0) {
          // reload the page
          location.reload();
         
        }
      }
    }
    
    // Toggle block slot equip (E key)
    toggleBlockEquip() {
      this.blocksEquipped = !this.blocksEquipped;
      
      if (this.blocksEquipped) {
        this.swordState = "none";
        this.buildingTurret = false;
      }
    }

    toggleTurretBuild() {
      this.buildingTurret = !this.buildingTurret;
      
      if (this.buildingTurret) {
        this.swordState = "none";
        this.blocksEquipped = false;
      }
    }
    
    // Update the sword's offset based on its state.
    // targetAngle is the angle from the player to the mouse.
    updateSword(deltaTime, targetAngle) {
      if (this.swordState === "none") return;
      
      let targetOffset;
      if (this.swordState === "holding") {
        targetOffset = { 
          x: Math.cos(targetAngle) * this.holdDistance, 
          y: Math.sin(targetAngle) * this.holdDistance 
        };
      } else if (this.swordState === "using") {
        targetOffset = { 
          x: Math.cos(targetAngle) * this.useDistance, 
          y: Math.sin(targetAngle) * this.useDistance 
        };
      }
      
      const springConstant = 50;
      const damping = 12;
      let result = springLerpVec(this.swordOffset, targetOffset, this.swordOffsetVelocity, deltaTime, springConstant, damping);
      this.swordOffset = result[0];
      this.swordOffsetVelocity = result[1];
      
      if (Math.hypot(this.swordOffset.x, this.swordOffset.y) > 0.001) {
        this.swordAngle = Math.atan2(this.swordOffset.y, this.swordOffset.x);
      } else {
        this.swordAngle = targetAngle;
      }
    }
    
    // Draw the player and (if equipped) the sword.
    draw(ctx) {
      ctx.fillStyle = 'blue';
      ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
      if (this.swordState !== "none") {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.swordOffset.x, this.y + this.swordOffset.y);
        ctx.strokeStyle = 'silver';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
  }
  