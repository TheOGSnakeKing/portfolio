# Nagaraj Raparthi Portfolio

A modern, interactive portfolio website showcasing the journey from Hollywood VFX Artist → Graphics Engineer → AI Engineer.

## ✨ Features

- **Interactive WebGL Particle System** - Name formed by 15,000+ particles that respond to mouse movement
- **Motion Matching Demo** - Live interactive demo tied to SIGGRAPH Asia 2020 research
- **Hidden Easter Egg** - Debug Runner mini-game (Konami code or triple-click copyright)
- **Responsive Design** - Optimized for all devices
- **Performance Optimized** - Lazy loading, efficient animations

## 🚀 Quick Start

### Local Development

Simply open `index.html` in a browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

### Deploy to Vercel

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TheOGSnakeKing/portfolio.git
git push -u origin main
```

2. Connect to Vercel:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Deploy (auto-detects as static site)

3. Add Custom Domain:
   - In Vercel dashboard → Settings → Domains
   - Add `nagarajraparthi.com`
   - Configure DNS at Namecheap:
     ```
     Type: A
     Host: @
     Value: 76.76.21.21
     
     Type: CNAME
     Host: www
     Value: cname.vercel-dns.com
     ```

## 📁 Project Structure

```
nagaraj-portfolio/
├── index.html              # Main HTML file
├── css/
│   ├── styles.css          # Main stylesheet
│   └── animations.css      # Animation effects
├── js/
│   ├── main.js             # Navigation & scroll effects
│   ├── particles.js        # Three.js particle system
│   ├── motion-matching.js  # Interactive character demo
│   └── easter-egg.js       # Debug Runner game
├── assets/
│   └── images/             # Project images
├── robots.txt
├── sitemap.xml
└── README.md
```

## 🎮 Easter Egg

Trigger the hidden Debug Runner game:
- **Konami Code:** ↑ ↑ ↓ ↓ ← → ← → B A
- **Triple-click** on the copyright text
- **URL Parameter:** `?game=true`

## 🛠 Tech Stack

- **Three.js** - WebGL particle system
- **GSAP** - Smooth scroll animations
- **Vanilla JS** - No framework dependencies
- **CSS Custom Properties** - Design system

## 📊 Performance Targets

- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s

## 📝 Customization

### Colors

Edit CSS variables in `css/styles.css`:

```css
:root {
  --accent-primary: #00d4ff;     /* Cyan */
  --accent-secondary: #7b61ff;   /* Purple */
  --bg-primary: #0a0a0f;         /* Background */
}
```

### Particle Count

Adjust in `js/particles.js`:

```javascript
getParticleCount() {
  // Mobile: 8000, Tablet: 15000, Desktop: 20000
}
```

## 📄 License

© 2025 Nagaraj Raparthi. All rights reserved.

## 🔗 Links

- [Live Site](https://nagarajraparthi.com)
- [LinkedIn](https://www.linkedin.com/in/nagaraj-raparthi-2031a7144/)
- [GitHub](https://github.com/TheOGSnakeKing)
- [SIGGRAPH Paper](https://dl.acm.org/doi/10.1145/3415264.3425474)
- [IMDB](https://www.imdb.com/name/nm9430735/)
