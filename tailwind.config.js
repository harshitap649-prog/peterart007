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
          pink: '#FF7BA3',
          purple: '#9d00ff',
          orange: '#ff6b00',
          blue: '#5B9FFF',
        },
        dark: {
          bg: '#000000',
          card: '#000000',
          border: '#2a2a2a',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #ff6b00, #FF7BA3, #5B9FFF)',
        'gradient-secondary': 'linear-gradient(135deg, #FF7BA3, #9d00ff)',
        'gradient-hover': 'linear-gradient(135deg, #ff8c00, #FF7BA3, #5B9FFF, #9d00ff)',
      },
    },
  },
  plugins: [],
}

