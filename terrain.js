// Terrain Class: Generates cave-like formations
class Terrain {
    constructor(tileSize, cols, rows, fillProbability = 0.45) {
      this.tileSize = tileSize;
      this.cols = cols;
      this.rows = rows;
      this.grid = [];
      for (let row = 0; row < rows; row++) {
        this.grid[row] = [];
        for (let col = 0; col < cols; col++) {
          this.grid[row][col] = { obstacle: Math.random() < fillProbability };
        }
      }
      const iterations = 4;
      for (let iter = 0; iter < iterations; iter++) {
        let newGrid = [];
        for (let row = 0; row < rows; row++) {
          newGrid[row] = [];
          for (let col = 0; col < cols; col++) {
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = row + dr;
                const nc = col + dc;
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
                  count++;
                } else if (this.grid[nr][nc].obstacle) {
                  count++;
                }
              }
            }
            newGrid[row][col] = { obstacle: count >= 5 };
          }
        }
        this.grid = newGrid;
      }
    }
    
    draw(ctx) {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          const tile = this.grid[row][col];
          ctx.fillStyle = tile.obstacle ? '#666' : '#7cfc00';
          ctx.fillRect(col * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize);
          ctx.strokeStyle = '#999';
          ctx.strokeRect(col * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }
    
    // Check collision with terrain obstacles.
    collides(entity) {
      const left = entity.x - entity.width/2;
      const right = entity.x + entity.width/2;
      const top = entity.y - entity.height/2;
      const bottom = entity.y + entity.height/2;
      const startCol = Math.floor(left / this.tileSize);
      const endCol = Math.floor(right / this.tileSize);
      const startRow = Math.floor(top / this.tileSize);
      const endRow = Math.floor(bottom / this.tileSize);
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) continue;
          if (this.grid[row][col].obstacle) {
            const tileX = col * this.tileSize;
            const tileY = row * this.tileSize;
            if (left < tileX + this.tileSize &&
                right > tileX &&
                top < tileY + this.tileSize &&
                bottom > tileY) {
              return true;
            }
          }
        }
      }
      return false;
    }
  }
  