/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#030712',
          900: '#070b14',
          850: '#0b1120',
          800: '#0f172a',
          750: '#131e36',
          700: '#1e293b',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        cyber: {
          violet: '#8b5cf6',
          purple: '#a855f7',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-glow': 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.18) 0%, transparent 60%)',
        'mesh-purple': 'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
        'mesh-cyan': 'radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.12) 0%, transparent 50%)',
      },
      boxShadow: {
        'neon-indigo': '0 0 25px -5px rgba(99, 102, 241, 0.4), 0 0 10px -5px rgba(99, 102, 241, 0.2)',
        'neon-violet': '0 0 25px -5px rgba(139, 92, 246, 0.4), 0 0 10px -5px rgba(139, 92, 246, 0.2)',
        'neon-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4), 0 0 10px -5px rgba(6, 182, 212, 0.2)',
        'neon-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.4), 0 0 10px -5px rgba(16, 185, 129, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'float-slow': 'float 7s ease-in-out infinite',
        'float-reverse': 'floatReverse 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'gradient-x': 'gradientX 10s ease infinite',
        'border-glow': 'borderGlow 4s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.25', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.08)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gradientX: {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(99, 102, 241, 0.3)' },
          '50%': { borderColor: 'rgba(139, 92, 246, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
