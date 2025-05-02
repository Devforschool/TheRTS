

class Game {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.input = new InputHandler(this.canvas);
      
      // Discrete key tracking for toggles
      this.qPressedLastFrame = false;
      this.zPressedLastFrame = false;
      this.ePressedLastFrame = false;
      this.rPressedLastFrame = false; // tracking for R key sell action
      this.wasMouseDown = false;
      this.turretPrice = 9;
      // Timers for recurring spawns
      this.chestSpawnTimer = 0;
      this.farmSpawnTimer = 0;


      
      // Create terrain and initialize player at center.
    
      this.terrain = new Terrain(40, 50, 50);
      this.navMesh = new NavMesh(this.terrain);

      this.player = new Player(
        this.terrain.cols * this.terrain.tileSize / 2,
        this.terrain.rows * this.terrain.tileSize / 2
      );
      // Remove obstacle from starting cell.
      const startCol = Math.floor(this.player.x / this.terrain.tileSize);
      const startRow = Math.floor(this.player.y / this.terrain.tileSize);
      if (this.terrain.grid[startRow] && this.terrain.grid[startRow][startCol]) {
        this.terrain.grid[startRow][startCol].obstacle = false;
      }
      
      // Blocks: snap to a 20×20 grid.
      this.placedBlocks = []; // will store Block instances
      this.placedTurrets = [];
      this.blockGridSize = 20;
      this.turretGridSize = 40;
      
      // Spawn initial chests and farms.
      this.chests = [];
      this.farms = [];
      this.zombies = [];
      this.graves = [];
      this.bullets = [];

      // Add these properties for zombie wave management:
      this.waveTimer = 0;
      this.currentWave = 1;
      this.zombieConfigs = [
        { speed: 45, health: 40, color: "green", damageInterval: 2.5, size: 10 },
        { speed: 50, health: 50, color: "darkgreen", damageInterval: 2, size: 10 },
        { speed: 40, health: 60, color: "brown", damageInterval: 1.75, size: 10 },
        { speed: 60, health: 35, color: "red", damageInterval: 1.5, size: 20 },
        { speed: 35, health: 70, color: "purple", damageInterval: 1.25, size: 20 },
        { speed: 55, health: 55, color: "orange", damageInterval: 1, size: 20 },
        { speed: 50, health: 65, color: "blue", damageInterval: 1, size: 30 },
        { speed: 65, health: 30, color: "pink", damageInterval: 1.25, size: 30 },
        { speed: 30, health: 80, color: "gray", damageInterval: 1.5, size: 30 },
        { speed: 70, health: 25, color: "black", damageInterval: 0.8, size: 50 },
        { speed: 80, health: 90, color: "yellow", damageInterval: 0.5, size: 100 },
      ];


      this.zombies = [];

      for (let i = 0; i < 4; i++) {
        this.spawnFarm();
      }
      this.spawnChest();
      this.spawnChest();

      
    for (let i = 0; i < 4; i++) {
      const graveX = Math.floor(Math.random() * this.terrain.cols * this.terrain.tileSize);
      const graveY = Math.floor(Math.random() * this.terrain.rows * this.terrain.tileSize);
      // Create a Grave instance (default size 20 or adjust as needed)
      this.graves.push(new Grave(graveX, graveY, 20));
    }
      
      this.camera = new Camera(this.canvas);
      this.ui = new UI(this.canvas, this.player); // initialize UI
      
      // Day/Night cycle properties.
      this.timeOfDay = 0;
      this.cycleLength = 120;
      
      this.lastTime = performance.now();
      this.gameLoop = this.gameLoop.bind(this);
      requestAnimationFrame(this.gameLoop);
    }
    
    spawnChest() {
      const maxAttempts = 20;
      let attempt = 0;
      while (attempt < maxAttempts) {
        const chestX = Math.floor(Math.random() * this.terrain.cols * this.terrain.tileSize);
        const chestY = Math.floor(Math.random() * this.terrain.rows * this.terrain.tileSize);
        const terrainCol = Math.floor(chestX / this.terrain.tileSize);
        const terrainRow = Math.floor(chestY / this.terrain.tileSize);
        if (this.terrain.grid[terrainRow] && !this.terrain.grid[terrainRow][terrainCol].obstacle) {
          this.chests.push(new Chest(chestX, chestY, 30, 30, 5));
          break;
        }
        attempt++;
      }
    }

    shootBullet(roation, bulletSpeed, bulletDamage,x,y,width,height) {
      // Create a new Bullet instance.
      console.log(x,y,roation,bulletSpeed,bulletDamage)
      const bullet = new FiredBullet(x, y, roation, bulletSpeed, bulletDamage, this);
      // Add the bullet to the game's bullet list.
      this.bullets.push(bullet);
    }
    
    spawnFarm() {
      const farmWidth = 40, farmHeight = 40;
      const maxAttempts = 20;
      let attempt = 0;
      while (attempt < maxAttempts) {
        const farmX = Math.floor(Math.random() * this.terrain.cols * this.terrain.tileSize);
        const farmY = Math.floor(Math.random() * this.terrain.rows * this.terrain.tileSize);
        const terrainCol = Math.floor(farmX / this.terrain.tileSize);
        const terrainRow = Math.floor(farmY / this.terrain.tileSize);
        if (this.terrain.grid[terrainRow] && !this.terrain.grid[terrainRow][terrainCol].obstacle) {
          this.farms.push(new Farm(farmX, farmY, farmWidth, farmHeight));
          break;
        }
        attempt++;
      }
    }
    
    checkPlacedBlocksCollision(entity) {
      return this.placedBlocks.some(block =>
        entity.x - entity.width / 2 < block.x + block.width &&
        entity.x + entity.width / 2 > block.x &&
        entity.y - entity.height / 2 < block.y + block.height &&
        entity.y + entity.height / 2 > block.y
      );
    }
    
    
    canPlaceBlockAt(cellCol, cellRow) {
      const blockSize = this.blockGridSize;
      const blockX = cellCol * blockSize;
      const blockY = cellRow * blockSize;
      const centerX = blockX + blockSize / 2;
      const centerY = blockY + blockSize / 2;
      const terrainCol = Math.floor(centerX / this.terrain.tileSize);
      const terrainRow = Math.floor(centerY / this.terrain.tileSize);
      
      // Ensure the terrain cell exists.
      if (!this.terrain.grid[terrainRow] || !this.terrain.grid[terrainRow][terrainCol]) {
        return false;
      }
      
      // Check if the terrain cell has an obstacle.
      if (this.terrain.grid[terrainRow][terrainCol].obstacle) return false;
      
      // Check collision with player.
      const playerLeft = this.player.x - this.player.width / 2;
      const playerRight = this.player.x + this.player.width / 2;
      const playerTop = this.player.y - this.player.height / 2;
      const playerBottom = this.player.y + this.player.height / 2;
      if (
        blockX < playerRight && blockX + blockSize > playerLeft &&
        blockY < playerBottom && blockY + blockSize > playerTop
      ) {
        return false;
      }
      
      // Avoid duplicate block placement.
      if (this.placedBlocks.some(block => block.x === blockX && block.y === blockY)) return false;
      if (this.placedTurrets.some(turret => turret.x === blockX && turret.y === blockY)) return false;
      
      return true;
    }

    canPlaceTurretAt(cellCol, cellRow) {
      const turretSize = this.turretGridSize;

      const turretX = cellCol * turretSize;
      const turretY = cellRow * turretSize;
      const centerX = turretX + turretSize / 2;
      const centerY = turretY + turretSize / 2;
      const terrainCol = Math.floor(centerX / this.terrain.tileSize);
      const terrainRow = Math.floor(centerY / this.terrain.tileSize);

      // Ensure the terrain cell exists.
      if (!this.terrain.grid[terrainRow] || !this.terrain.grid[terrainRow][terrainCol]) {
        return false;
      }

      // Check if the terrain cell has an obstacle.
      if (this.terrain.grid[terrainRow][terrainCol].obstacle) return false;

      // Check collision with player.
      const playerLeft = this.player.x - this.player.width / 2;
      const playerRight = this.player.x + this.player.width / 2;
      const playerTop = this.player.y - this.player.height / 2;
      const playerBottom = this.player.y + this.player.height / 2;
      if (
        turretX < playerRight && turretX + turretSize > playerLeft &&
        turretY < playerBottom && turretY + turretSize > playerTop
      ) {
        return false;
      }

      // Avoid duplicate block placement.
      if (this.placedBlocks.some(block => block.x === turretX && block.y === turretY)) return false;
      if (this.placedTurrets.some(turret => turret.x === turretX && turret.y === turretY)) return false;

      return true;
    }
    
    
    processInput(deltaTime) {
      // Handle block equip toggle (E key).
      if (this.input.keys['e'] && !this.ePressedLastFrame) {
        this.player.toggleBlockEquip();
        this.ePressedLastFrame = true;
      } else if (!this.input.keys['e']) {
        this.ePressedLastFrame = false;
      }
    
      if (this.input.keys['z'] && !this.zPressedLastFrame) {
        this.player.toggleTurretBuild();
        this.zPressedLastFrame = true;
      } else if (!this.input.keys['z']) {
        this.zPressedLastFrame = false;
      }
      
      // Process mouse input.
      if (this.input.mouseDown && !this.wasMouseDown) {
        // A fresh click/drag started – reset processed tiles.
        this.lastProcessedBlockTile = null;
        this.lastProcessedTurretTile = null;
      }
      
      if (this.input.mouseDown) {
        const clickWorldX = this.input.mouse.x + this.camera.x;
        const clickWorldY = this.input.mouse.y + this.camera.y;
        
        // BLOCK GRID PROCESSING
        const blockCellCol = Math.floor(clickWorldX / this.blockGridSize);
        const blockCellRow = Math.floor(clickWorldY / this.blockGridSize);
        
        // Only process if the block tile has changed.
        if (!this.lastProcessedBlockTile || 
            this.lastProcessedBlockTile.col !== blockCellCol || 
            this.lastProcessedBlockTile.row !== blockCellRow) {
          
          let clickProcessed = false;
          
          // Check chests.
          for (let i = 0; i < this.chests.length; i++) {
            if (this.chests[i].containsPoint(clickWorldX, clickWorldY)) {
              this.player.blockCount += this.chests[i].blockReward;
              this.chests.splice(i, 1);
              clickProcessed = true;
              break;
            }
          }
          
          // Check farms.
          if (!clickProcessed) {
            for (let farm of this.farms) {
              if (farm.containsPoint(clickWorldX, clickWorldY)) {
                if (!farm.claimed) {
                  farm.claim(this.player);
                } else {
                  // Only upgrade on a fresh click (tile changed).
                  if (!this.wasMouseDown) {
                    farm.upgrade(this.player);
                  }
                }
                clickProcessed = true;
                break;
              }
            }
          }
          
          // Handle block placement/upgrading.
          if (!clickProcessed && this.player.blocksEquipped) {
            const blockSize = this.blockGridSize;
            const existingBlock = this.placedBlocks.find(block => 
              block.x === blockCellCol * blockSize && block.y === blockCellRow * blockSize
            );
            if (existingBlock) {
              // Only upgrade on a new click/drag.
              if (this.player.blockCount >= 2 && (!this.lastProcessedBlockTile || 
                  this.lastProcessedBlockTile.col !== blockCellCol || 
                  this.lastProcessedBlockTile.row !== blockCellRow)) {
                existingBlock.durability = (existingBlock.durability || 1) + 1;
              
                this.player.blockCount -= 2;
                clickProcessed = true;
              }
            } else {
              if (this.player.blockCount >= 1 && this.canPlaceBlockAt(blockCellCol, blockCellRow)) {
                const block = new Block(blockCellCol * blockSize, blockCellRow * blockSize, blockSize, 1);
                block.game = this;
                this.placedBlocks.push(block);
                this.player.blockCount -= 1;
                clickProcessed = true;
              }
            }
          }
          
          // Update last processed block tile.
          this.lastProcessedBlockTile = { col: blockCellCol, row: blockCellRow };
        }
        


        // TURRET GRID PROCESSING
        if (this.input.mouseDown) {


          const turretCellCol = Math.floor(clickWorldX / this.turretGridSize);
          const turretCellRow = Math.floor(clickWorldY / this.turretGridSize);
          


          // Only process if turret tile changed.
          if (!this.lastProcessedTurretTile ||
            this.lastProcessedTurretTile.col !== turretCellCol ||
            this.lastProcessedTurretTile.row !== turretCellRow) {
            let turretProcessed = false;
          
            const turretSize = this.turretGridSize;
            const existingTurret = this.placedTurrets.find(turret => 
              turret.x === turretCellCol * turretSize && turret.y === turretCellRow * turretSize
            );
            
            if (existingTurret) {
            if (!this.wasMouseDown) {
                console.log("trigged upgrade");
                existingTurret.upgrade(this.player);
            }
            turretProcessed = true; 
            }
           

            if (this.player.buildingTurret && !turretProcessed) {
              const turretSize = this.turretGridSize;
              const existingTurret = this.placedTurrets.find(turret => 
                turret.x === turretCellCol * turretSize && turret.y === turretCellRow * turretSize
              );
              console.log(existingTurret);
              if (!existingTurret) {
                if (this.player.blockCount >= this.turretPrice && this.canPlaceTurretAt(turretCellCol, turretCellRow)) {
                  console.log("created turret");
                  const turret = new Turret(turretCellCol * turretSize, turretCellRow * turretSize, turretSize, turretSize);
                  turret.game = this;
                  this.placedTurrets.push(turret);
                  this.player.blockCount -= this.turretPrice;
                  turretProcessed = true;
                }
              }
            }
            
            // Update last processed turret tile.
            this.lastProcessedTurretTile = { col: turretCellCol, row: turretCellRow };
          }
        }
        
        // Handle selling blocks when R key is pressed.
        if (this.input.keys['r']) {
          const mouseWorldX = this.input.mouse.x + this.camera.x;
          const mouseWorldY = this.input.mouse.y + this.camera.y;
          
          for (let i = 0; i < this.placedBlocks.length; i++) {
            const block = this.placedBlocks[i];
            if (block.containsPoint(mouseWorldX, mouseWorldY)) {
              const refund = Math.floor(block.durability / 2);
              this.player.blockCount += refund;
              this.placedBlocks.splice(i, 1);
              break;
            }
          }
        }
        
        this.wasMouseDown = true;
      } else {
        // Reset mouse state and last processed tiles when mouse is released.
        this.wasMouseDown = false;
        this.lastProcessedBlockTile = null;
        this.lastProcessedTurretTile = null;
      }
      
      // Handle sword toggle (Q key).
      if (this.input.keys['q'] && !this.qPressedLastFrame) {
        this.player.toggleSword();
        this.qPressedLastFrame = true;
      } else if (!this.input.keys['q']) {
        this.qPressedLastFrame = false;
      }
    }
    
  
    
    update(deltaTime) {
      this.zombies.forEach(zombie => {
         zombie.move(deltaTime);
      })

      this.bullets.forEach(bullet => {
        bullet.update(deltaTime);
      })
      // Update day/night cycle.
      this.timeOfDay = (this.timeOfDay + deltaTime) % this.cycleLength;
      
      // Spawn zombie waves from graves during night.
if (this.timeOfDay >= this.cycleLength / 2) { // Night time condition.
  this.waveTimer += deltaTime;
  // Adjust the spawn interval as needed (here every 20 seconds of night).
  if (this.waveTimer >= 20) {
    // The number of zombies in this wave increases with wave number.
    const zombiesToSpawn = this.currentWave + 2;
    for (let i = 0; i < zombiesToSpawn; i++) {
      // Choose a random grave as the spawn point.
      const grave = this.graves[Math.floor(Math.random() * this.graves.length)];
      // Pick one of the 10 preset zombie configurations.
      const configIndex = Math.floor(Math.random() * this.zombieConfigs.length);
      const baseConfig = this.zombieConfigs[configIndex];
      // Scale the zombie’s speed and health by the current wave to make them tougher.
      const zombie = new Zombie(
        grave.x,
        grave.y,
        {
          width: 20,
          height: 20,
          speed: baseConfig.speed + this.currentWave * 2, 
          health: baseConfig.health + this.currentWave * 5,
          color: baseConfig.color,
          navMesh: this.navMesh,
          width: baseConfig.size,
          height: baseConfig.size,
          damageInterval: baseConfig.damageInterval
        }

      );
      zombie.setTarget(this.player);
      zombie.game = this;
      this.zombies.push(zombie);
    }
    this.waveTimer = 0;
    this.currentWave++;
  }
} else {
  // Reset the wave timer if it's not night.
  this.waveTimer = 0;
}

      // Update recurring spawns.
      this.chestSpawnTimer += deltaTime;
      if (this.chestSpawnTimer >= 30) {
        this.spawnChest();
        this.chestSpawnTimer = 0;
      }
      this.farmSpawnTimer += deltaTime;
      if (this.farmSpawnTimer >= 60) {
        // this.spawnFarm();
        this.farmSpawnTimer = 0;
      }
      
      // Update farms.
      for (let farm of this.farms) {
        farm.update(deltaTime, this.player);
      }

      for (let turret of this.placedTurrets) {
        turret.update(deltaTime);
      }
      
      // Process input events.
      this.processInput(deltaTime);
      
      // Update sprinting and stamina.
      const isShiftDown = this.input.isKeyDown('shift');

      // Track if player was sprinting last frame (you'll need to initialize this in your constructor/init)
      if (!this.player.wasSprinting) {
          this.player.wasSprinting = false;
      }
      
      // Determine if we can start or continue sprinting
      this.canSprint = false;
      if (isShiftDown) {
          // If we weren't sprinting last frame, need at least 10 stamina to start
          if (!this.player.wasSprinting && this.player.stamina >= 10) {
            this.canSprint = true;
          }
          // If we were already sprinting, can continue until stamina reaches 0
          else if (this.player.wasSprinting && this.player.stamina > 0) {
            this.canSprint = true;
          }
      }
      
      const sprintMultiplier = this.canSprint ? 1.5 : 1;
      
      if (this.canSprint) {
          // Reduce stamina over time while sprinting
          this.player.stamina -= 30 * deltaTime;
          if (this.player.stamina < 0) {
              this.player.stamina = 0;
          }
          this.player.wasSprinting = true;
      } else {
          // Regenerate stamina when not sprinting
          this.player.stamina += 10 * deltaTime;
          this.player.wasSprinting = false;
      }
      
      // Clamp stamina between 0 and maxStamina
      this.player.stamina = Math.min(this.player.maxStamina, Math.max(0, this.player.stamina));
      
      // Update player movement with collision resolution.
      const originalX = this.player.x;
      const originalY = this.player.y;
      if (this.input.isKeyDown('a')) {
        this.player.x -= this.player.speed * sprintMultiplier * deltaTime;
      }
      if (this.input.isKeyDown('d')) {
        this.player.x += this.player.speed * sprintMultiplier * deltaTime;
      }
      if (this.terrain.collides(this.player) || this.checkPlacedBlocksCollision(this.player)) {
        this.player.x = originalX;
      }
     
      if (this.input.isKeyDown('w')) {
        this.player.y -= this.player.speed * sprintMultiplier * deltaTime;
      }
      if (this.input.isKeyDown('s')) {
        this.player.y += this.player.speed * sprintMultiplier * deltaTime;
      }
      if (this.terrain.collides(this.player) || this.checkPlacedBlocksCollision(this.player)) {
        this.player.y = originalY;
      }
      const halfWidth = this.player.width / 2;
      const halfHeight = this.player.height / 2;
      this.player.x = Math.max(halfWidth, Math.min(this.player.x, this.terrain.cols * this.terrain.tileSize - halfWidth));
      this.player.y = Math.max(halfHeight, Math.min(this.player.y, this.terrain.rows * this.terrain.tileSize - halfHeight));
      
      // Update sword offset and state.
      const targetAngle = Math.atan2(
        (this.input.mouse.y + this.camera.y) - this.player.y,
        (this.input.mouse.x + this.camera.x) - this.player.x
      );
      if (this.player.swordState !== "none") {
        this.player.swordState = (!this.player.blocksEquipped && !this.player.buildingTurret && this.input.mouseDown) ? "using" : "holding";
        this.player.updateSword(deltaTime, targetAngle);
      }
      
      // Update camera to follow the player.
      this.camera.update(this.player, deltaTime);
    }
    
    draw() {
      // Clear the canvas.
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      
      // Save context and apply camera transform.
      this.ctx.save();
      this.ctx.translate(-this.camera.x, -this.camera.y);
      
      this.terrain.draw(this.ctx);
     
      
      
      // Draw placed blocks.
      for (let block of this.placedBlocks) {
        block.draw(this.ctx);
      }

      
      
      // Draw chests and farms and graves.
      this.chests.forEach(chest => chest.draw(this.ctx));
      this.farms.forEach(farm => farm.draw(this.ctx));
      this.graves.forEach(grave => grave.draw(this.ctx));
      this.bullets.forEach(bullet => bullet.draw(this.ctx));
      this.zombies.forEach(zombie => zombie.render(this.ctx));
      this.placedTurrets.forEach(turret => turret.draw(this.ctx));
      
      
      // Draw block placement preview.
      if (this.player.blocksEquipped) {
        const blockSize = this.blockGridSize;
        const cellCol = Math.floor((this.input.mouse.x + this.camera.x) / this.blockGridSize);
        const cellRow = Math.floor((this.input.mouse.y + this.camera.y) / this.blockGridSize);
        const previewX = cellCol * this.blockGridSize;
        const previewY = cellRow * this.blockGridSize;
        let previewValid = false;
        const maxCellsX = Math.floor(this.terrain.cols * this.terrain.tileSize / this.blockGridSize);
        const maxCellsY = Math.floor(this.terrain.rows * this.terrain.tileSize / this.blockGridSize);
        if (cellCol >= 0 && cellCol < maxCellsX && cellRow >= 0 && cellRow < maxCellsY) {
          previewValid = this.canPlaceBlockAt(cellCol, cellRow);
        }
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = previewValid ? "green" : "red";
        this.ctx.fillRect(previewX, previewY, blockSize, blockSize);
        this.ctx.globalAlpha = 1;
      }

      if (this.player.buildingTurret) {
        const turretSize = this.turretGridSize;
        const cellCol = Math.floor((this.input.mouse.x + this.camera.x) / this.turretGridSize);
        const cellRow = Math.floor((this.input.mouse.y + this.camera.y) / this.turretGridSize);
        const previewX = cellCol * this.turretGridSize;
        const previewY = cellRow * this.turretGridSize;
        let previewValid = false;
        const maxCellsX = Math.floor(this.terrain.cols * this.terrain.tileSize / this.turretGridSize);
        const maxCellsY = Math.floor(this.terrain.rows * this.terrain.tileSize / this.turretGridSize);
        if (cellCol >= 0 && cellCol < maxCellsX && cellRow >= 0 && cellRow < maxCellsY) {
          previewValid = this.canPlaceTurretAt(cellCol, cellRow);
        }
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = previewValid ? "green" : "red";
        this.ctx.fillRect(previewX, previewY, turretSize, turretSize);
        this.ctx.globalAlpha = 1;
      }
      
      this.player.draw(this.ctx);
      this.ctx.restore();
      
      // Draw UI overlay.
      this.ui.draw();
      
      // Draw Day/Night overlay.
      const t = this.timeOfDay / this.cycleLength;
      const brightness = 0.5 - 0.5 * Math.cos(2 * Math.PI * t);
      const overlayAlpha = (1 - brightness) * 0.5;
      this.ctx.save();
      this.ctx.fillStyle = `rgba(0, 0, 0, ${overlayAlpha.toFixed(2)})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }
   
    gameLoop(timestamp) {
      const deltaTime = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;
      
      this.update(deltaTime);
      this.draw();
      
      requestAnimationFrame(this.gameLoop);
    }
  }
    
  // Initialize the Game
  window.addEventListener('DOMContentLoaded', () => {
    let game = new Game('gameCanvas');
    // loop over game.farms
    game.farms.forEach(farm => {
      // loop over farm.placedBlocks
      farm.game = game;
    });
    game.gameLoop(0);
  });
  
