/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        aegis: {
          primary:   '#4f46e5',
          primary2:  '#6d28d9',
          danger:    '#dc2626',
          warning:   '#f59e0b',
          success:   '#10b981',
          ink:       '#0f172a',
          surface:   '#f8fafc',
          muted:     '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      screens: {
        xs: '375px',
        '3xl': '1920px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-indigo': '0 0 40px -10px rgba(79,70,229,0.5)',
        'glow-red':    '0 0 40px -10px rgba(220,38,38,0.4)',
        'card':        '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06)',
        'card-hover':  '0 10px 30px -5px rgba(0,0,0,.10), 0 4px 6px -2px rgba(0,0,0,.05)',
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in':     'fadeIn 0.4s ease forwards',
        'slide-up':    'slideUp 0.4s ease forwards',
        'bounce-soft': 'bounceSoft 1s ease infinite',
        'spin-slow':   'spin 8s linear infinite',
        'ping-slow':   'ping 2s cubic-bezier(0,0,0.2,1) infinite',
      },
      keyframes: {
        fadeIn:     { from: { opacity: '0' },              to: { opacity: '1' } },
        slideUp:    { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        bounceSoft: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-indigo': 'radial-gradient(at 40% 20%, hsla(240,100%,74%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.10) 0px, transparent 50%)',
      },
    }
  },
  plugins: []
};
