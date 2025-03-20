class NavMesh {
  constructor(terrain) {
    this.terrain = terrain;
    this.cols = terrain.cols;
    this.rows = terrain.rows;
    this.tileSize = terrain.tileSize;
    // Cache object to store computed paths
    // Key format: "startCol,startRow-endCol,endRow" and value: { timestamp, path }
    this.cache = {};
  }

  // Helper to check if a grid cell is walkable.
  isWalkable(col, row) {
    // Check bounds and whether tile is an obstacle.
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return false;
    return !this.terrain.grid[row][col].obstacle;
  }

  // A* pathfinding from (startX, startY) to (endX, endY) in world coordinates.
  findPath(startX, startY, endX, endY) {
    // Convert world coordinates to grid coordinates.
    const startCol = Math.floor(startX / this.tileSize);
    const startRow = Math.floor(startY / this.tileSize);
    const endCol = Math.floor(endX / this.tileSize);
    const endRow = Math.floor(endY / this.tileSize);

    // Create a unique key for the cache.
    const cacheKey = `${startCol},${startRow}-${endCol},${endRow}`;
    const now = Date.now();
    if (this.cache[cacheKey] && now - this.cache[cacheKey].timestamp < 2000) {
      // Return cached path if within 2 seconds.
      return this.cache[cacheKey].path;
    }

    // Node structure for A*
    class Node {
      constructor(col, row, g = 0, h = 0, parent = null) {
        this.col = col;
        this.row = row;
        this.g = g;
        this.h = h;
        this.f = g + h;
        this.parent = parent;
      }
    }

    // Heuristic: Manhattan distance (alternatively, diagonal distance could be used).
    const heuristic = (col, row) => Math.abs(col - endCol) + Math.abs(row - endRow);

    let openList = [];
    let closedList = new Set();

    // Create a key string for a grid cell.
    const key = (col, row) => `${col},${row}`;

    const startNode = new Node(startCol, startRow, 0, heuristic(startCol, startRow));
    openList.push(startNode);

    while (openList.length > 0) {
      // Sort openList so that lowest f is at the front.
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift();

      if (current.col === endCol && current.row === endRow) {
        // Reconstruct path by backtracking from current node.
        let path = [];
        let curr = current;
        while (curr) {
          path.push({ col: curr.col, row: curr.row });
          curr = curr.parent;
        }
        path.reverse();

        // Cache the result with the current timestamp.
        this.cache[cacheKey] = {
          timestamp: Date.now(),
          path
        };
        return path;
      }
      closedList.add(key(current.col, current.row));

      // Check neighbors in 8 directions: horizontal, vertical, and diagonal.
      const neighborOffsets = [
        { dc: 1, dr: 0 },
        { dc: -1, dr: 0 },
        { dc: 0, dr: 1 },
        { dc: 0, dr: -1 },
        { dc: 1, dr: 1 },
        { dc: 1, dr: -1 },
        { dc: -1, dr: 1 },
        { dc: -1, dr: -1 }
      ];

      for (let offset of neighborOffsets) {
        const nCol = current.col + offset.dc;
        const nRow = current.row + offset.dr;

        // For diagonal movement, check that adjacent horizontal and vertical cells are walkable.
        if (offset.dc !== 0 && offset.dr !== 0) {
          if (!this.isWalkable(current.col + offset.dc, current.row) || 
              !this.isWalkable(current.col, current.row + offset.dr)) {
            continue;
          }
        }
        if (!this.isWalkable(nCol, nRow) || closedList.has(key(nCol, nRow))) continue;

        // Use cost 1 for orthogonal moves, and ~1.414 (Math.SQRT2) for diagonal moves.
        const moveCost = (offset.dc !== 0 && offset.dr !== 0) ? Math.SQRT2 : 1;
        const gScore = current.g + moveCost;

        let neighborNode = openList.find(node => node.col === nCol && node.row === nRow);
        if (!neighborNode) {
          neighborNode = new Node(nCol, nRow, gScore, heuristic(nCol, nRow), current);
          openList.push(neighborNode);
        } else if (gScore < neighborNode.g) {
          neighborNode.g = gScore;
          neighborNode.f = neighborNode.g + neighborNode.h;
          neighborNode.parent = current;
        }
      }
    }
    // No path found; cache the empty result.
    this.cache[cacheKey] = {
      timestamp: Date.now(),
      path: []
    };
    return [];
  }
}
