/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#141416',
          panel: 'rgba(28, 28, 30, 0.85)',
          sidebar: 'rgba(20, 20, 22, 0.92)',
          card: 'rgba(38, 38, 42, 0.65)',
          cardHover: 'rgba(52, 52, 58, 0.85)',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.18)',
          accent: '#0A84FF',
          accentHover: '#0071E3',
          textMuted: '#86868B',
          textPrimary: '#F5F5F7',
          quicklook: 'rgba(15, 15, 18, 0.92)'
        }
      },
      backdropBlur: {
        '2xl': '40px',
        '3xl': '60px'
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.55)',
        'quicklook': '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.12)'
      },
      animation: {
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      }
    },
  },
  plugins: [],
}
