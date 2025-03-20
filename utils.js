// Utility Functions

// Spring simulation for a single numeric component (allows overshoot)
function springLerpComponent(current, target, velocity, deltaTime, springConstant, damping) {
    const diff = target - current;
    const acceleration = springConstant * diff - damping * velocity;
    velocity += acceleration * deltaTime;
    current += velocity * deltaTime;
    return [current, velocity];
}
  
  // Spring simulation for 2D vectors (component‑wise)
function springLerpVec(current, target, velocity, deltaTime, springConstant, damping) {
    const [newX, newVx] = springLerpComponent(current.x, target.x, velocity.x, deltaTime, springConstant, damping);
    const [newY, newVy] = springLerpComponent(current.y, target.y, velocity.y, deltaTime, springConstant, damping);
    return [{ x: newX, y: newY }, { x: newVx, y: newVy }];
}  
  
  // Linear interpolation (used by camera)
function lerp(a, b, t) {
    return a + (b - a) * t;
}
  