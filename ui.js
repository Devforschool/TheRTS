class UI {
  constructor(canvas, player) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.player = player;
  }

  draw() {
      const ctx = this.ctx;
      const cw = this.canvas.width;
      const ch = this.canvas.height;

      ctx.save();
      ctx.font = "16px sans-serif";
      ctx.textBaseline = "middle";

      // --- Health Bar ---
      const healthBarWidth = 200;
      const healthBarHeight = 20;
      const healthX = 20;
      const healthY = ch - 80;
      ctx.fillStyle = "red";
      ctx.fillRect(healthX, healthY, (this.player.health / this.player.maxHealth) * healthBarWidth, healthBarHeight);
      ctx.strokeStyle = "black";
      ctx.strokeRect(healthX, healthY, healthBarWidth, healthBarHeight);
      ctx.fillStyle = "white";
      ctx.fillText("Health", healthX + 5, healthY + healthBarHeight / 2);

      // --- Stamina Bar ---
      const staminaBarWidth = 200;
      const staminaBarHeight = 20;
      const staminaX = 20;
      const staminaY = ch - 50;
      ctx.fillStyle = "yellow";
      ctx.fillRect(staminaX, staminaY, (this.player.stamina / this.player.maxStamina) * staminaBarWidth, staminaBarHeight);
      ctx.strokeStyle = "black";
      ctx.strokeRect(staminaX, staminaY, staminaBarWidth, staminaBarHeight);
      ctx.fillStyle = "black";
      ctx.fillText("Stamina", staminaX + 5, staminaY + staminaBarHeight / 2);

      // --- Inventory Slot for the Sword ---
      const slotSize = 40;
      const swordSlotX = cw - slotSize - 20;
      const swordSlotY = ch - slotSize - 20;
      ctx.fillStyle = "gray";
      ctx.fillRect(swordSlotX, swordSlotY, slotSize, slotSize);
      ctx.strokeStyle = "black";
      ctx.strokeRect(swordSlotX, swordSlotY, slotSize, slotSize);
      if (this.player.swordState !== "none") {
          ctx.beginPath();
          ctx.moveTo(swordSlotX + 10, swordSlotY + 30);
          ctx.lineTo(swordSlotX + 30, swordSlotY + 10);
          ctx.strokeStyle = "silver";
          ctx.lineWidth = 2;
          ctx.stroke();
      }
      ctx.lineWidth = 1;
      ctx.fillStyle = "white";
      ctx.fillText("Q", swordSlotX + slotSize - 16, swordSlotY + slotSize - 8);

      // --- Inventory Slot for Blocks ---
      const blockSlotSize = 40;
      const blockSlotX = cw - blockSlotSize - 20;
      const blockSlotY = ch - blockSlotSize - 80;
      ctx.fillStyle = "gray";
      ctx.fillRect(blockSlotX, blockSlotY, blockSlotSize, blockSlotSize);
      ctx.strokeStyle = "black";
      ctx.strokeRect(blockSlotX, blockSlotY, blockSlotSize, blockSlotSize);
      ctx.fillStyle = "#444";
      const iconMargin = 8;
      ctx.fillRect(blockSlotX + iconMargin, blockSlotY + iconMargin, blockSlotSize - iconMargin * 2, blockSlotSize - iconMargin * 2);
      ctx.fillStyle = "white";
      ctx.fillText("E", blockSlotX + blockSlotSize - 16, blockSlotY + blockSlotSize - 8);
      ctx.fillStyle = "yellow";
      ctx.fillText(this.player.blockCount, blockSlotX + 4, blockSlotY + 14);
      if (this.player.blocksEquipped) {
          ctx.strokeStyle = "cyan";
          ctx.lineWidth = 3;
          ctx.strokeRect(blockSlotX, blockSlotY, blockSlotSize, blockSlotSize);
      }

      // --- Turret Build Button ---
      ctx.lineWidth = 1
      const turretSlotSize = 40;
      const turretSlotX = cw - turretSlotSize - 20;
      const turretSlotY = ch - turretSlotSize - 140;
      ctx.fillStyle = "gray";
      ctx.strokeStyle = "black";
      ctx.fillRect(turretSlotX, turretSlotY, turretSlotSize, turretSlotSize);
      
      ctx.strokeRect(turretSlotX, turretSlotY, turretSlotSize, turretSlotSize);
      ctx.fillStyle = "darkred";
      ctx.beginPath();
      ctx.fillRect(turretSlotX + 10, turretSlotY + 10, turretSlotSize - 20, turretSlotSize - 20);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.fillText("Z", turretSlotX + turretSlotSize - 16, turretSlotY + turretSlotSize - 8);
      if (this.player.buildingTurret) {
        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 3;
        ctx.strokeRect(turretSlotX, turretSlotY, turretSlotSize, turretSlotSize);
      }

      ctx.restore();
  }
}
