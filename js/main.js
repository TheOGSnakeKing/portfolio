/**
 * MAIN.JS
 * Navigation, scroll effects, animations, and initialization
 */

// ============================================
// NAVIGATION
// ============================================

class Navigation {
  constructor() {
    this.nav = document.getElementById('nav');
    this.toggle = document.getElementById('nav-toggle');
    this.links = document.getElementById('nav-links');
    this.lastScroll = 0;
    
    this.init();
  }
  
  init() {
    // Toggle mobile menu
    this.toggle.addEventListener('click', () => this.toggleMenu());
    
    // Close menu on link click
    this.links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });
    
    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!this.nav.contains(e.target)) {
        this.closeMenu();
      }
    });
    
    // Scroll behavior
    window.addEventListener('scroll', () => this.handleScroll());
    
    // Active link highlighting
    this.setupActiveLinks();
  }
  
  toggleMenu() {
    this.toggle.classList.toggle('active');
    this.links.classList.toggle('open');
    document.body.style.overflow = this.links.classList.contains('open') ? 'hidden' : '';
  }
  
  closeMenu() {
    this.toggle.classList.remove('active');
    this.links.classList.remove('open');
    document.body.style.overflow = '';
  }
  
  handleScroll() {
    const currentScroll = window.scrollY;
    
    // Add/remove scrolled class
    if (currentScroll > 50) {
      this.nav.classList.add('scrolled');
    } else {
      this.nav.classList.remove('scrolled');
    }
    
    this.lastScroll = currentScroll;
  }
  
  setupActiveLinks() {
    const sections = document.querySelectorAll('section[id]');
    const links = this.links.querySelectorAll('a');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-50% 0px -50% 0px'
    });
    
    sections.forEach(section => observer.observe(section));
  }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

class ScrollAnimations {
  constructor() {
    this.init();
  }
  
  init() {
    // Simple AOS-like animation system
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => observer.observe(el));
    
    // Parallax elements
    this.setupParallax();
    
    // Timeline animations
    this.setupTimeline();
    
    // Film card hover effects
    this.setupFilmCards();
  }
  
  setupParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    if (parallaxElements.length === 0) return;
    
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      
      parallaxElements.forEach(el => {
        const speed = el.dataset.speed || 0.5;
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
    });
  }
  
  setupTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 100);
        }
      });
    }, {
      threshold: 0.2
    });
    
    timelineItems.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(item);
    });
    
    // Add visible styles
    const style = document.createElement('style');
    style.textContent = `
      .timeline-item.visible {
        opacity: 1 !important;
        transform: translateX(0) !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  setupFilmCards() {
    const filmCards = document.querySelectorAll('.film-card');
    
    filmCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.querySelector('.film-overlay').style.opacity = '1';
      });
      
      card.addEventListener('mouseleave', () => {
        card.querySelector('.film-overlay').style.opacity = '0';
      });
    });
  }
}

// ============================================
// SMOOTH SCROLL
// ============================================

class SmoothScroll {
  constructor() {
    this.init();
  }
  
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (!target) return;
        
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      });
    });
  }
}

// ============================================
// MAGNETIC BUTTONS
// ============================================

class MagneticButtons {
  constructor() {
    this.init();
  }
  
  init() {
    const buttons = document.querySelectorAll('.btn, .social-link, .contact-social-link');
    
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }
}

// ============================================
// TYPING EFFECT
// ============================================

class TypingEffect {
  constructor(element, texts, speed = 100) {
    this.element = element;
    this.texts = texts;
    this.speed = speed;
    this.textIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    
    if (this.element) {
      this.type();
    }
  }
  
  type() {
    const currentText = this.texts[this.textIndex];
    
    if (this.isDeleting) {
      this.element.textContent = currentText.substring(0, this.charIndex - 1);
      this.charIndex--;
    } else {
      this.element.textContent = currentText.substring(0, this.charIndex + 1);
      this.charIndex++;
    }
    
    let delay = this.speed;
    
    if (this.isDeleting) {
      delay /= 2;
    }
    
    if (!this.isDeleting && this.charIndex === currentText.length) {
      delay = 2000;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.textIndex = (this.textIndex + 1) % this.texts.length;
      delay = 500;
    }
    
    setTimeout(() => this.type(), delay);
  }
}

// ============================================
// GSAP SCROLL TRIGGERS (if available)
// ============================================

function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  
  gsap.registerPlugin(ScrollTrigger);
  
  // Hero fade out on scroll
  gsap.to('.hero-content', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    },
    y: -100,
    opacity: 0
  });
  
  // Section titles
  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 30,
      opacity: 0,
      duration: 0.8
    });
  });
  
  // Skill tags stagger
  gsap.utils.toArray('.skill-category').forEach(category => {
    const tags = category.querySelectorAll('.skill-tag');
    
    gsap.from(tags, {
      scrollTrigger: {
        trigger: category,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 20,
      opacity: 0,
      stagger: 0.05,
      duration: 0.4
    });
  });
}

// ============================================
// CURSOR GLOW (optional enhancement)
// ============================================

class CursorGlow {
  constructor() {
    if (window.matchMedia('(hover: none)').matches) return;
    
    this.cursor = document.createElement('div');
    this.cursor.className = 'cursor-glow';
    this.cursor.style.cssText = `
      position: fixed;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      z-index: 0;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(this.cursor);
    
    this.init();
  }
  
  init() {
    document.addEventListener('mousemove', (e) => {
      this.cursor.style.left = e.clientX + 'px';
      this.cursor.style.top = e.clientY + 'px';
      this.cursor.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', () => {
      this.cursor.style.opacity = '0';
    });
  }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Core functionality
  new Navigation();
  new ScrollAnimations();
  new SmoothScroll();
  
  // Enhancements
  new MagneticButtons();
  
  // Optional cursor glow (desktop only)
  if (window.innerWidth > 1024) {
    new CursorGlow();
  }
  
  // Initialize GSAP if available
  initGSAP();
  
  // Update copyright year
  const copyright = document.getElementById('copyright');
  if (copyright) {
    const year = new Date().getFullYear();
    copyright.textContent = `© ${year} Nagaraj Raparthi`;
  }
  
  console.log('%c🎮 Hint: Try the Konami code or triple-click the copyright!', 
    'color: #00d4ff; font-size: 14px; font-weight: bold;');
});

// Preload critical resources
window.addEventListener('load', () => {
  // Hide loader once everything is loaded
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
    }
  }, 500);
});
