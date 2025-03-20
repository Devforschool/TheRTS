// Input Handler: Tracks keyboard and mouse
class InputHandler {
    constructor(canvas) {
      this.keys = {};
      this.mouse = { x: 0, y: 0 };
      this.mouseDown = false;
      
      window.addEventListener('keydown', (e) => {
        this.keys[e.key.toLowerCase()] = true;
      });
      window.addEventListener('keyup', (e) => {
        this.keys[e.key.toLowerCase()] = false;
      });
      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      });
      canvas.addEventListener('mousedown', () => {
        this.mouseDown = true;
      });
      canvas.addEventListener('mouseup', () => {
        this.mouseDown = false;
      });
    }
    
    isKeyDown(key) {
      return !!this.keys[key.toLowerCase()];
    }
  }
  