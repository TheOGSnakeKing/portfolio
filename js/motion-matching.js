/**
 * MOTION MATCHING DEMO
 * Interactive 2D character that follows cursor with state-based animation
 */

class MotionMatchingDemo {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Set canvas size
    this.resize();
    
    // Character state
    this.character = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      targetX: this.canvas.width / 2,
      targetY: this.canvas.height / 2,
      vx: 0,
      vy: 0,
      direction: 1, // 1 = right, -1 = left
      frame: 0,
      state: 'IDLE'
    };
    
    // Animation data
    this.animations = {
      IDLE: { frames: 4, fps: 4 },
      WALK: { frames: 6, fps: 8 },
      RUN: { frames: 6, fps: 12 }
    };
    
    this.frameTime = 0;
    this.lastTime = 0;
    
    // Dust particles
    this.dustParticles = [];
    
    // UI elements
    this.stateDisplay = document.getElementById('anim-state');
    this.velocityDisplay = document.getElementById('velocity');
    
    this.init();
  }
  
  resize() {
    const wrapper = this.canvas.parentElement;
    const rect = wrapper.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }
  
  init() {
    // Event listeners
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
    window.addEventListener('resize', () => this.resize());
    
    // Start animation loop
    this.animate(0);
  }
  
  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.character.targetX = e.clientX - rect.left;
    this.character.targetY = e.clientY - rect.top;
  }
  
  onTouchMove(e) {
    e.preventDefault();
    if (e.touches[0]) {
      const rect = this.canvas.getBoundingClientRect();
      this.character.targetX = e.touches[0].clientX - rect.left;
      this.character.targetY = e.touches[0].clientY - rect.top;
    }
  }
  
  selectAnimation(velocity) {
    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    
    if (speed < 0.5) return 'IDLE';
    if (speed < 4.0) return 'WALK';
    return 'RUN';
  }
  
  spawnDust() {
    if (this.character.state === 'RUN' && Math.random() < 0.3) {
      this.dustParticles.push({
        x: this.character.x - this.character.direction * 10,
        y: this.character.y + 20,
        vx: -this.character.direction * (Math.random() * 2 + 1),
        vy: -(Math.random() * 2 + 1),
        life: 1,
        size: Math.random() * 4 + 2
      });
    }
  }
  
  updateDust(deltaTime) {
    for (let i = this.dustParticles.length - 1; i >= 0; i--) {
      const p = this.dustParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.life -= deltaTime * 2;
      
      if (p.life <= 0) {
        this.dustParticles.splice(i, 1);
      }
    }
  }
  
  update(deltaTime) {
    // Calculate velocity towards target
    const dx = this.character.targetX - this.character.x;
    const dy = this.character.targetY - this.character.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Smooth movement
    const speed = Math.min(distance * 0.1, 15);
    
    if (distance > 5) {
      this.character.vx = (dx / distance) * speed;
      this.character.vy = (dy / distance) * speed;
      
      // Update direction
      if (Math.abs(this.character.vx) > 0.5) {
        this.character.direction = this.character.vx > 0 ? 1 : -1;
      }
    } else {
      this.character.vx *= 0.9;
      this.character.vy *= 0.9;
    }
    
    // Update position
    this.character.x += this.character.vx;
    this.character.y += this.character.vy;
    
    // Keep in bounds
    this.character.x = Math.max(30, Math.min(this.canvas.width - 30, this.character.x));
    this.character.y = Math.max(30, Math.min(this.canvas.height - 30, this.character.y));
    
    // Select animation state
    const velocity = { x: this.character.vx, y: this.character.vy };
    const newState = this.selectAnimation(velocity);
    
    // Reset frame on state change
    if (newState !== this.character.state) {
      this.character.state = newState;
      this.character.frame = 0;
      this.frameTime = 0;
    }
    
    // Update animation frame
    const anim = this.animations[this.character.state];
    this.frameTime += deltaTime;
    
    if (this.frameTime >= 1 / anim.fps) {
      this.character.frame = (this.character.frame + 1) % anim.frames;
      this.frameTime = 0;
    }
    
    // Spawn dust particles
    this.spawnDust();
    this.updateDust(deltaTime);
    
    // Update UI
    this.updateUI(velocity);
  }
  
  updateUI(velocity) {
    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    
    if (this.stateDisplay) {
      this.stateDisplay.textContent = this.character.state;
    }
    if (this.velocityDisplay) {
      this.velocityDisplay.textContent = speed.toFixed(1);
    }
  }
  
  drawCharacter() {
    const ctx = this.ctx;
    const { x, y, direction, frame, state } = this.character;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(direction, 1);
    
    // Character colors
    const bodyColor = '#00d4ff';
    const headColor = '#7b61ff';
    const eyeColor = '#ffffff';
    
    // Animation offsets based on state and frame
    let bobY = 0;
    let legAngle = 0;
    let armAngle = 0;
    
    if (state === 'WALK') {
      bobY = Math.sin(frame * Math.PI / 3) * 2;
      legAngle = Math.sin(frame * Math.PI / 3) * 0.4;
      armAngle = -legAngle;
    } else if (state === 'RUN') {
      bobY = Math.sin(frame * Math.PI / 3) * 4;
      legAngle = Math.sin(frame * Math.PI / 3) * 0.6;
      armAngle = -legAngle * 1.2;
    }
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 25, 15, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw legs
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    // Left leg
    ctx.save();
    ctx.translate(-5, 8 + bobY);
    ctx.rotate(legAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 15);
    ctx.stroke();
    ctx.restore();
    
    // Right leg
    ctx.save();
    ctx.translate(5, 8 + bobY);
    ctx.rotate(-legAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 15);
    ctx.stroke();
    ctx.restore();
    
    // Draw body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.roundRect(-10, -15 + bobY, 20, 25, 5);
    ctx.fill();
    
    // Draw arms
    ctx.strokeStyle = bodyColor;
    
    // Left arm
    ctx.save();
    ctx.translate(-12, -5 + bobY);
    ctx.rotate(armAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-8, 12);
    ctx.stroke();
    ctx.restore();
    
    // Right arm
    ctx.save();
    ctx.translate(12, -5 + bobY);
    ctx.rotate(-armAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(8, 12);
    ctx.stroke();
    ctx.restore();
    
    // Draw head
    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.arc(0, -25 + bobY, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eyes
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(3, -27 + bobY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye highlight
    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.arc(2, -28 + bobY, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Antenna
    ctx.strokeStyle = headColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -37 + bobY);
    ctx.lineTo(0, -42 + bobY);
    ctx.stroke();
    
    ctx.fillStyle = '#ff6b9d';
    ctx.beginPath();
    ctx.arc(0, -44 + bobY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  drawDust() {
    const ctx = this.ctx;
    
    for (const p of this.dustParticles) {
      ctx.fillStyle = `rgba(255, 255, 255, ${p.life * 0.5})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  drawGrid() {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    
    const gridSize = 40;
    
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }
  }
  
  draw() {
    const ctx = this.ctx;
    
    // Clear canvas
    ctx.fillStyle = '#1a1a24';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid
    this.drawGrid();
    
    // Draw dust
    this.drawDust();
    
    // Draw character
    this.drawCharacter();
    
    // Draw velocity vector
    if (Math.abs(this.character.vx) > 0.5 || Math.abs(this.character.vy) > 0.5) {
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.character.x, this.character.y);
      ctx.lineTo(
        this.character.x + this.character.vx * 5,
        this.character.y + this.character.vy * 5
      );
      ctx.stroke();
    }
  }
  
  animate(timestamp) {
    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    
    if (deltaTime < 0.1) { // Prevent huge jumps
      this.update(deltaTime);
      this.draw();
    }
    
    requestAnimationFrame((t) => this.animate(t));
  }
}

// Initialize when DOM is ready
function initMotionDemo() {
  const canvas = document.getElementById('motion-canvas');
  if (canvas) {
    new MotionMatchingDemo(canvas);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMotionDemo);
} else {
  initMotionDemo();
}
