/**
 * PARTICLE SYSTEM
 * Three.js WebGL particles that form the name "NAGARAJ RAPARTHI"
 */

class ParticleSystem {
  constructor(container) {
    this.container = container;
    this.width = container.offsetWidth;
    this.height = container.offsetHeight;
    
    // Performance adaptive particle count
    this.particleCount = this.getParticleCount();
    
    // State
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    this.scrollProgress = 0;
    this.isFormmed = false;
    this.formProgress = 0;
    this.clock = new THREE.Clock();
    
    // Settings
    this.settings = {
      mouseRadius: 0.15,
      mouseStrength: 0.08,
      formSpeed: 0.02,
      noiseScale: 0.003,
      noiseSpeed: 0.0005,
      particleSize: 2.5,
      colors: [
        new THREE.Color(0x00d4ff), // Cyan
        new THREE.Color(0x7b61ff), // Purple
        new THREE.Color(0xff6b9d)  // Pink
      ]
    };
    
    this.init();
    this.createTextPositions();
    this.createParticles();
    this.addEventListeners();
    this.animate();
  }
  
  getParticleCount() {
    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    
    if (isMobile || isLowEnd) return 8000;
    if (window.innerWidth < 1200) return 15000;
    return 20000;
  }
  
  init() {
    // Scene
    this.scene = new THREE.Scene();
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.z = 2;
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  
  createTextPositions() {
    // Create canvas to get text positions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const fontSize = Math.min(this.width * 0.08, 120);
    canvas.width = this.width;
    canvas.height = this.height;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${fontSize}px 'Sora', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw name
    ctx.fillText('NAGARAJ RAPARTHI', canvas.width / 2, canvas.height / 2);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // Extract positions from white pixels
    this.textPositions = [];
    const step = 3; // Sample every 3rd pixel for performance
    
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        const i = (y * canvas.width + x) * 4;
        if (pixels[i] > 128) {
          // Convert to normalized coordinates
          const nx = (x / canvas.width - 0.5) * 2 * (this.width / this.height);
          const ny = (0.5 - y / canvas.height) * 2;
          this.textPositions.push(new THREE.Vector3(nx, ny, 0));
        }
      }
    }
  }
  
  createParticles() {
    // Geometry
    this.geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(this.particleCount * 3);
    const targetPositions = new Float32Array(this.particleCount * 3);
    const randomOffsets = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);
    
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      // Initial scattered positions
      positions[i3] = (Math.random() - 0.5) * 4;
      positions[i3 + 1] = (Math.random() - 0.5) * 4;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;
      
      // Target position (from text)
      const textPos = this.textPositions[i % this.textPositions.length];
      targetPositions[i3] = textPos.x + (Math.random() - 0.5) * 0.02;
      targetPositions[i3 + 1] = textPos.y + (Math.random() - 0.5) * 0.02;
      targetPositions[i3 + 2] = (Math.random() - 0.5) * 0.1;
      
      // Random offsets for noise animation
      randomOffsets[i3] = Math.random() * 1000;
      randomOffsets[i3 + 1] = Math.random() * 1000;
      randomOffsets[i3 + 2] = Math.random() * 1000;
      
      // Colors - gradient based on x position
      const t = (textPos.x + 1.5) / 3; // Normalize x to 0-1
      const color = new THREE.Color();
      if (t < 0.5) {
        color.lerpColors(this.settings.colors[0], this.settings.colors[1], t * 2);
      } else {
        color.lerpColors(this.settings.colors[1], this.settings.colors[2], (t - 0.5) * 2);
      }
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      // Sizes
      sizes[i] = Math.random() * this.settings.particleSize + 0.5;
    }
    
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));
    this.geometry.setAttribute('randomOffset', new THREE.BufferAttribute(randomOffsets, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uFormProgress: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseRadius: { value: this.settings.mouseRadius },
        uMouseStrength: { value: this.settings.mouseStrength },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uScrollProgress: { value: 0 }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uFormProgress;
        uniform vec2 uMouse;
        uniform float uMouseRadius;
        uniform float uMouseStrength;
        uniform float uPixelRatio;
        uniform float uScrollProgress;
        
        attribute vec3 targetPosition;
        attribute vec3 randomOffset;
        attribute float size;
        attribute vec3 color;
        
        varying vec3 vColor;
        varying float vAlpha;
        
        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          i = mod289(i);
          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        void main() {
          vColor = color;
          
          // Mix between scattered and formed positions
          vec3 pos = mix(position, targetPosition, uFormProgress);
          
          // Add noise animation
          float noiseScale = 0.5;
          float noiseTime = uTime * 0.2;
          vec3 noisePos = pos + randomOffset;
          
          float noiseX = snoise(vec3(noisePos.x * noiseScale + noiseTime, noisePos.y * noiseScale, noisePos.z)) * 0.05;
          float noiseY = snoise(vec3(noisePos.x * noiseScale, noisePos.y * noiseScale + noiseTime, noisePos.z)) * 0.05;
          float noiseZ = snoise(vec3(noisePos.x * noiseScale, noisePos.y * noiseScale, noisePos.z + noiseTime)) * 0.03;
          
          // Reduce noise when formed
          float noiseMult = 1.0 - uFormProgress * 0.7;
          pos.x += noiseX * noiseMult;
          pos.y += noiseY * noiseMult;
          pos.z += noiseZ * noiseMult;
          
          // Mouse interaction
          vec2 mouseDir = pos.xy - uMouse;
          float mouseDist = length(mouseDir);
          
          if (mouseDist < uMouseRadius) {
            float force = (1.0 - mouseDist / uMouseRadius) * uMouseStrength;
            pos.xy += normalize(mouseDir) * force;
            pos.z += force * 0.5;
          }
          
          // Scroll fade out - particles drift up and fade
          pos.y += uScrollProgress * 1.5;
          pos.z -= uScrollProgress * 0.5;
          vAlpha = 1.0 - uScrollProgress;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Size attenuation
          gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          // Circular particle with soft edge
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          float alpha = smoothstep(0.5, 0.2, dist) * vAlpha;
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    // Points
    this.particles = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.particles);
  }
  
  addEventListeners() {
    // Mouse move
    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = (e.clientX / this.width - 0.5) * 2 * (this.width / this.height);
      this.targetMouse.y = (0.5 - e.clientY / this.height) * 2;
    });
    
    // Touch move
    window.addEventListener('touchmove', (e) => {
      if (e.touches[0]) {
        this.targetMouse.x = (e.touches[0].clientX / this.width - 0.5) * 2 * (this.width / this.height);
        this.targetMouse.y = (0.5 - e.touches[0].clientY / this.height) * 2;
      }
    });
    
    // Click explosion
    this.container.addEventListener('click', () => {
      this.explode();
    });
    
    // Scroll
    window.addEventListener('scroll', () => {
      const heroHeight = document.querySelector('.hero').offsetHeight;
      this.scrollProgress = Math.min(window.scrollY / (heroHeight * 0.5), 1);
    });
    
    // Resize
    window.addEventListener('resize', () => this.onResize());
  }
  
  explode() {
    // Briefly scatter particles
    this.formProgress = 0;
    
    // Update positions for explosion
    const positions = this.geometry.attributes.position.array;
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      positions[i3] += (Math.random() - 0.5) * 0.5;
      positions[i3 + 1] += (Math.random() - 0.5) * 0.5;
      positions[i3 + 2] += (Math.random() - 0.5) * 0.3;
    }
    this.geometry.attributes.position.needsUpdate = true;
  }
  
  onResize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    this.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    
    // Recreate text positions for new size
    this.createTextPositions();
    
    // Update target positions
    const targetPositions = this.geometry.attributes.targetPosition.array;
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      const textPos = this.textPositions[i % this.textPositions.length];
      targetPositions[i3] = textPos.x + (Math.random() - 0.5) * 0.02;
      targetPositions[i3 + 1] = textPos.y + (Math.random() - 0.5) * 0.02;
    }
    this.geometry.attributes.targetPosition.needsUpdate = true;
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    const elapsed = this.clock.getElapsedTime();
    
    // Smooth mouse
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.1;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.1;
    
    // Form progress - animate towards 1
    this.formProgress += (1 - this.formProgress) * this.settings.formSpeed;
    
    // Update uniforms
    this.material.uniforms.uTime.value = elapsed;
    this.material.uniforms.uFormProgress.value = this.formProgress;
    this.material.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
    this.material.uniforms.uScrollProgress.value = this.scrollProgress;
    
    this.renderer.render(this.scene, this.camera);
  }
  
  destroy() {
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}

// Initialize when DOM is ready
let particleSystem = null;

function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (canvas && typeof THREE !== 'undefined') {
    particleSystem = new ParticleSystem(canvas);
    
    // Hide loader after particles initialize
    setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) {
        loader.classList.add('hidden');
      }
    }, 500);
  }
}

// Wait for Three.js to load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initParticles, 100);
  });
} else {
  setTimeout(initParticles, 100);
}
