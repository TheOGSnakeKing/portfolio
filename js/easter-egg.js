/**
 * DEBUG RUNNER - Easter Egg Game
 * Side-scrolling endless runner themed around software development
 */

class DebugRunner {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container = document.getElementById('game-container');
    this.overlay = document.getElementById('game-overlay');
    this.gameOverOverlay = document.getElementById('game-over');
    
    // Game config
    this.config = {
      gravity: 0.8,
      jumpForce: -14,
      gameSpeed: 5,
      speedIncrement: 0.001,
      groundY: 320,
      spawnRate: 100
    };
    
    // Game state
    this.state = {
      score: 0,
      highScore: parseInt(localStorage.getItem('debugRunnerHighScore') || '0'),
      isPlaying: false,
      isGameOver: false,
      player: {
        x: 80,
        y: this.config.groundY,
        vy: 0,
        width: 30,
        height: 50,
        isJumping: false,
        frame: 0
      },
      obstacles: [],
      collectibles: [],
      particles: [],
      clouds: [],
      codeLines: [],
      frameCount: 0,
      currentSpeed: this.config.gameSpeed
    };
    
    // Colors matching portfolio theme
    this.colors = {
      bg: '#12121a',
      ground: '#1a1a24',
      player: '#00d4ff',
      playerAccent: '#7b61ff',
      obstacle: '#ff4466',
      collectible: '#00ff88',
      cloud: '#1a1a24',
      text: '#ffffff',
      textMuted: '#606070'
    };
    
    this.init();
  }
  
  init() {
    // Initialize clouds and code lines
    for (let i = 0; i < 5; i++) {
      this.state.clouds.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * 150 + 30,
        width: Math.random() * 60 + 40,
        speed: Math.random() * 0.5 + 0.2
      });
    }
    
    for (let i = 0; i < 10; i++) {
      this.state.codeLines.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * 200 + 50,
        text: this.getRandomCodeSnippet(),
        speed: Math.random() * 1 + 0.5,
        alpha: Math.random() * 0.1 + 0.05
      });
    }
    
    // Event listeners
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    this.canvas.addEventListener('touchstart', () => this.jump());
    
    document.getElementById('game-close').addEventListener('click', () => this.close());
    document.getElementById('game-restart').addEventListener('click', () => this.restart());
    
    // Start render loop (but not game logic)
    this.render();
  }
  
  getRandomCodeSnippet() {
    const snippets = [
      'const debug = true;',
      'if (bug) fix();',
      'return success;',
      'await deploy();',
      'git push origin',
      'npm install',
      '// TODO: fix',
      'console.log()',
      'try { } catch',
      'while (coding)',
      'import React',
      'export default',
      'function run()',
      'let score = 0;',
      '{ status: ok }'
    ];
    return snippets[Math.floor(Math.random() * snippets.length)];
  }
  
  handleKeyDown(e) {
    if (!this.container.classList.contains('active')) return;
    
    if (e.code === 'Space') {
      e.preventDefault();
      if (!this.state.isPlaying && !this.state.isGameOver) {
        this.start();
      } else if (!this.state.isGameOver) {
        this.jump();
      }
    }
    
    if (e.code === 'Escape') {
      this.close();
    }
  }
  
  handleKeyUp(e) {
    // Allow variable jump height
    if (e.code === 'Space' && this.state.player.vy < -5) {
      this.state.player.vy = -5;
    }
  }
  
  jump() {
    if (!this.state.player.isJumping) {
      this.state.player.vy = this.config.jumpForce;
      this.state.player.isJumping = true;
    }
  }
  
  start() {
    this.state.isPlaying = true;
    this.state.isGameOver = false;
    this.overlay.style.display = 'none';
    this.gameOverOverlay.classList.remove('active');
    this.gameLoop();
  }
  
  restart() {
    this.state = {
      ...this.state,
      score: 0,
      isPlaying: false,
      isGameOver: false,
      player: {
        x: 80,
        y: this.config.groundY,
        vy: 0,
        width: 30,
        height: 50,
        isJumping: false,
        frame: 0
      },
      obstacles: [],
      collectibles: [],
      particles: [],
      frameCount: 0,
      currentSpeed: this.config.gameSpeed
    };
    this.gameOverOverlay.classList.remove('active');
    this.start();
  }
  
  close() {
    this.container.classList.remove('active');
    this.state.isPlaying = false;
    document.body.style.overflow = '';
  }
  
  show() {
    this.container.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.overlay.style.display = 'flex';
    this.gameOverOverlay.classList.remove('active');
  }
  
  spawnObstacle() {
    const types = [
      { emoji: '🐛', width: 30, height: 30, name: 'bug' },
      { emoji: '💥', width: 40, height: 50, name: 'merge conflict' },
      { emoji: '📛', width: 35, height: 35, name: '404' }
    ];
    
    const type = types[Math.floor(Math.random() * types.length)];
    
    this.state.obstacles.push({
      x: this.canvas.width + 50,
      y: this.config.groundY - type.height + 30,
      ...type
    });
  }
  
  spawnCollectible() {
    const types = [
      { emoji: '⭐', points: 10, name: 'commit' },
      { emoji: '🚀', points: 50, name: 'deploy' },
      { emoji: '☕', points: 25, name: 'coffee' }
    ];
    
    const type = types[Math.floor(Math.random() * types.length)];
    
    this.state.collectibles.push({
      x: this.canvas.width + 50,
      y: this.config.groundY - Math.random() * 100 - 50,
      width: 25,
      height: 25,
      ...type
    });
  }
  
  spawnParticle(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
      this.state.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 3,
        life: 1,
        color,
        size: Math.random() * 4 + 2
      });
    }
  }
  
  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
  
  update() {
    const { player, obstacles, collectibles, particles } = this.state;
    
    this.state.frameCount++;
    this.state.currentSpeed += this.config.speedIncrement;
    
    // Update player
    player.vy += this.config.gravity;
    player.y += player.vy;
    
    // Ground collision
    if (player.y >= this.config.groundY) {
      player.y = this.config.groundY;
      player.vy = 0;
      player.isJumping = false;
    }
    
    // Update player animation
    if (!player.isJumping) {
      if (this.state.frameCount % 5 === 0) {
        player.frame = (player.frame + 1) % 4;
      }
    }
    
    // Spawn obstacles
    if (this.state.frameCount % Math.floor(this.config.spawnRate / (this.state.currentSpeed / 5)) === 0) {
      if (Math.random() < 0.7) {
        this.spawnObstacle();
      }
    }
    
    // Spawn collectibles
    if (this.state.frameCount % 80 === 0 && Math.random() < 0.5) {
      this.spawnCollectible();
    }
    
    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= this.state.currentSpeed;
      
      // Check collision
      if (this.checkCollision(player, obstacles[i])) {
        this.gameOver();
        return;
      }
      
      // Remove off-screen
      if (obstacles[i].x < -50) {
        obstacles.splice(i, 1);
        this.state.score += 5;
      }
    }
    
    // Update collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
      collectibles[i].x -= this.state.currentSpeed;
      
      // Check collection
      if (this.checkCollision(player, collectibles[i])) {
        this.state.score += collectibles[i].points;
        this.spawnParticle(collectibles[i].x, collectibles[i].y, this.colors.collectible, 8);
        collectibles.splice(i, 1);
        continue;
      }
      
      // Remove off-screen
      if (collectibles[i].x < -30) {
        collectibles.splice(i, 1);
      }
    }
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life -= 0.03;
      
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
    
    // Update clouds
    for (const cloud of this.state.clouds) {
      cloud.x -= cloud.speed;
      if (cloud.x < -cloud.width) {
        cloud.x = this.canvas.width + cloud.width;
        cloud.y = Math.random() * 150 + 30;
      }
    }
    
    // Update code lines
    for (const line of this.state.codeLines) {
      line.x -= line.speed;
      if (line.x < -200) {
        line.x = this.canvas.width + 50;
        line.y = Math.random() * 200 + 50;
        line.text = this.getRandomCodeSnippet();
      }
    }
    
    // Update score display
    document.getElementById('game-score').textContent = this.state.score;
  }
  
  gameOver() {
    this.state.isPlaying = false;
    this.state.isGameOver = true;
    
    // Screen shake effect
    this.canvas.style.animation = 'shake 0.3s ease';
    setTimeout(() => {
      this.canvas.style.animation = '';
    }, 300);
    
    // Update high score
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
      localStorage.setItem('debugRunnerHighScore', this.state.highScore.toString());
    }
    
    // Show game over
    document.getElementById('final-score').textContent = this.state.score;
    document.getElementById('high-score').textContent = this.state.highScore;
    this.gameOverOverlay.classList.add('active');
  }
  
  drawPlayer() {
    const ctx = this.ctx;
    const { player } = this.state;
    
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height);
    
    // Body
    ctx.fillStyle = this.colors.player;
    ctx.beginPath();
    ctx.roundRect(-player.width / 2, -player.height, player.width, player.height - 10, 8);
    ctx.fill();
    
    // Head
    ctx.fillStyle = this.colors.playerAccent;
    ctx.beginPath();
    ctx.arc(0, -player.height + 5, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(4, -player.height + 3, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Legs (animated)
    ctx.strokeStyle = this.colors.player;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    const legOffset = player.isJumping ? 0 : Math.sin(player.frame * Math.PI / 2) * 8;
    
    // Left leg
    ctx.beginPath();
    ctx.moveTo(-6, -10);
    ctx.lineTo(-6 - legOffset, 0);
    ctx.stroke();
    
    // Right leg
    ctx.beginPath();
    ctx.moveTo(6, -10);
    ctx.lineTo(6 + legOffset, 0);
    ctx.stroke();
    
    ctx.restore();
  }
  
  render() {
    const ctx = this.ctx;
    
    // Background
    ctx.fillStyle = this.colors.bg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Code lines (parallax background)
    ctx.font = '12px "JetBrains Mono", monospace';
    for (const line of this.state.codeLines) {
      ctx.fillStyle = `rgba(0, 212, 255, ${line.alpha})`;
      ctx.fillText(line.text, line.x, line.y);
    }
    
    // Clouds
    for (const cloud of this.state.clouds) {
      ctx.fillStyle = this.colors.cloud;
      ctx.beginPath();
      ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, 15, 0, 0, Math.PI * 2);
      ctx.ellipse(cloud.x - 20, cloud.y + 5, 20, 12, 0, 0, Math.PI * 2);
      ctx.ellipse(cloud.x + 25, cloud.y + 5, 15, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Ground
    ctx.fillStyle = this.colors.ground;
    ctx.fillRect(0, this.config.groundY + 30, this.canvas.width, 80);
    
    // Ground line
    ctx.strokeStyle = this.colors.player;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.config.groundY + 30);
    ctx.lineTo(this.canvas.width, this.config.groundY + 30);
    ctx.stroke();
    
    // Particles
    for (const p of this.state.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    
    // Collectibles
    ctx.font = '24px serif';
    for (const c of this.state.collectibles) {
      ctx.fillText(c.emoji, c.x, c.y + c.height);
    }
    
    // Obstacles
    ctx.font = '32px serif';
    for (const o of this.state.obstacles) {
      ctx.fillText(o.emoji, o.x, o.y + o.height);
    }
    
    // Player
    this.drawPlayer();
    
    requestAnimationFrame(() => this.render());
  }
  
  gameLoop() {
    if (!this.state.isPlaying) return;
    
    this.update();
    
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Easter egg triggers
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let tripleClickCount = 0;
let tripleClickTimer = null;
let game = null;

function initGame() {
  game = new DebugRunner();
  
  // Konami code listener
  document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
      game.show();
      konamiCode = [];
    }
  });
  
  // Triple-click on copyright
  const copyright = document.getElementById('copyright');
  if (copyright) {
    copyright.addEventListener('click', () => {
      tripleClickCount++;
      
      if (tripleClickTimer) clearTimeout(tripleClickTimer);
      
      tripleClickTimer = setTimeout(() => {
        tripleClickCount = 0;
      }, 500);
      
      if (tripleClickCount >= 3) {
        game.show();
        tripleClickCount = 0;
      }
    });
  }
  
  // URL parameter
  if (new URLSearchParams(window.location.search).get('game') === 'true') {
    setTimeout(() => game.show(), 1000);
  }
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
document.head.appendChild(style);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
