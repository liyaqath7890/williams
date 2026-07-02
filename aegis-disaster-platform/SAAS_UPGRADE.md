# Aegis SaaS — Upgrade Guide

## What Was Upgraded

### 1. SaaS Landing Page (`HomePage.jsx`)
- Full SaaS marketing page with hero, stats strip, feature grid, role cards, **3-tier pricing** (Community / Response / Command), testimonials, mobile APK callout, and footer.
- Animated with Framer Motion (staggered fade-up on scroll).
- Fully mobile-responsive down to 375px screens.

### 2. Design System (`tailwind.config.js` + `index.css`)
- Extended Tailwind with SaaS tokens: `aegis.*` brand colors, `glow-*` shadows, `card-lift`, `glass`, `glass-dark`, `bg-grid`, `bg-animated`, `text-gradient`, `saas-badge`, `sos-ring`.
- PWA/APK CSS: `--safe-top`, `--safe-bottom` CSS vars, `pb-safe`, `pt-safe`, `.bottom-nav` with backdrop blur.
- Touch target enforcement: `min-height: 44px` on all buttons/links on `pointer: coarse` devices.
- Skeleton shimmer, status dot, hero glow, noise texture utilities.

### 3. Dashboard Layout (`DashboardLayout.jsx`)
- **Mobile bottom navigation bar** — shows 5 role-relevant links per role (victim/helper/authority/admin).
- Slide-in sidebar drawer with **Framer Motion spring animation** on mobile.
- Notification popover with live unread count from Redux alerts.
- Role-coloured gradient user card in sidebar.
- Safe-area padding for notched phones (iPhone X+) and Android APK.
- Active route indicator dots in bottom nav.

### 4. PWA & APK Readiness (`vite.config.js` + `index.html` + `manifest.json`)
- PWA manifest with `shortcuts` (SOS, Map) that appear on Android home screen.
- Workbox runtime caching for API, fonts, and CDN assets.
- Navigate fallback for SPA routing in service worker.
- Mobile viewport: `viewport-fit=cover`, `user-scalable=no`, `apple-mobile-web-app-capable`.
- **`capacitor.config.ts`** — ready for `npx cap add android` → APK build.

---

## Converting to Android APK

```bash
# 1. Install Capacitor
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/splash-screen @capacitor/push-notifications @capacitor/geolocation

# 2. Build the web app
npm run build

# 3. Add Android platform
npx cap add android

# 4. Copy web assets to Android
npx cap sync android

# 5. Open in Android Studio
npx cap open android

# In Android Studio → Build → Generate Signed APK / Bundle
```

For **live reload** during development:
1. Set your machine's IP in `capacitor.config.ts` `server.url`
2. Run `npm run dev` then `npx cap run android`

---

## Deploying as SaaS

### Frontend (Vercel / Netlify)
```bash
npm run build
# Deploy the dist/ folder
# Set VITE_API_URL env var to your backend URL
```

### Backend (Railway / Render / AWS)
```bash
# Set all env vars from backend/.env.example
npm start
```

### Docker
```bash
docker compose up -d
```

---

## Mobile Responsive Breakpoints

| Breakpoint | Width   | Layout                          |
|------------|---------|---------------------------------|
| `xs`       | 375px+  | Base mobile (iPhone SE)         |
| `sm`       | 640px+  | Tablet portrait                 |
| `md`       | 768px+  | Tablet landscape                |
| `lg`       | 1024px+ | Desktop — sidebar visible       |
| `xl`       | 1280px+ | Wide desktop                    |

Mobile dashboard uses **bottom tab bar** (5 links).  
Desktop uses **72px fixed left sidebar** with full navigation.
