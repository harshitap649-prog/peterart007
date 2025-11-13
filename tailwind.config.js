/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#ff00ff',
          purple: '#9d00ff',
          orange: '#ff6b00',
          blue: '#00d4ff',
        },
        dark: {
          bg: '#0a0a0a',
          card: '#1a1a1a',
          border: '#2a2a2a',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #ff6b00, #ff00ff)',
        'gradient-secondary': 'linear-gradient(135deg, #ff00ff, #9d00ff)',
        'gradient-hover': 'linear-gradient(135deg, #ff8c00, #ff00ff, #9d00ff)',
      },
    },
  },
  plugins: [],
}

