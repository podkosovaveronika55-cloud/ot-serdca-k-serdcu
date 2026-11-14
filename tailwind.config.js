/** @type {import('tailwindcss').Config} */

// полная шкала прозрачности: /8, /12, /45, /85 и т. д.
const opacity = {}
for (let i = 0; i <= 100; i++) opacity[i] = (i / 100).toFixed(2)

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: { 900: '#070714', 800: '#0c0a24', 700: '#131033', 600: '#1b1645' },
        ice: { DEFAULT: '#bfe3ff', soft: '#e6f4ff' },
        gold: { DEFAULT: '#ffc857', light: '#ffe7a8', deep: '#e0952b' },
        berry: { DEFAULT: '#ff6f59', deep: '#b33a34' },
        pine: { DEFAULT: '#2f9e62', deep: '#0b4b33' },
        frost: { DEFAULT: '#dbe6f5', deep: '#8d9ab5' },
      },
      fontFamily: {
        display: ['Georgia', '"Palatino Linotype"', '"Times New Roman"', 'serif'],
        ui: ['"Trebuchet MS"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      opacity,
      boxShadow: {
        glow: '0 0 40px rgba(255,200,87,.35)',
        'glow-lg': '0 0 90px rgba(255,200,87,.45)',
        inset: 'inset 0 0 0 1.5px rgba(255,255,255,.14)',
      },
      backgroundImage: {
        'sky-radial': 'radial-gradient(120% 90% at 50% 0%, #221a54 0%, #0c0a24 55%, #070714 100%)',
      },
      keyframes: {
        sway: { '0%,100%': { transform: 'rotate(-3.5deg)' }, '50%': { transform: 'rotate(3.5deg)' } },
        twinkle: { '0%,100%': { opacity: '.45', transform: 'scale(.9)' }, '50%': { opacity: '1', transform: 'scale(1.1)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        pulseGlow: { '0%,100%': { opacity: '.55' }, '50%': { opacity: '1' } },
        rise: { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'none' } },
        spinSlow: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        sway: 'sway 5s ease-in-out infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 4s ease-in-out infinite',
        rise: 'rise .7s ease both',
        spinSlow: 'spinSlow 40s linear infinite',
      },
    },
  },
  plugins: [],
}
