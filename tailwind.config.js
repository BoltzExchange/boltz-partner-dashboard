/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        boltz: {
          primary: '#e8cb2b',
          'primary-light': '#fee86b',
          'primary-glow': 'rgba(232, 203, 43, 0.4)',
          link: '#4fadc2',
          'link-hover': '#70cde2',
        },
        navy: {
          50: '#d0d4d9',
          100: '#a1a9b2',
          200: '#727e8c',
          300: '#1e2d3c',
          400: '#17222e',
          500: '#12253a',
          600: '#0f1f30',
          700: '#091625',
          800: '#09141f',
          900: '#081E36',
        },
        text: {
          primary: '#d7dee4',
          secondary: '#a1a9b2',
          muted: '#727e8c',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Noto Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
      }
    },
  },
  plugins: [],
}
