/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#1a1a1a',
          light: '#f5f5f5',
          border: '#e5e5e5',
        },
        'brand-pink': '#FFC0CB',
        'brand-purple': '#E6E6FA',
        'brand-lime': '#BFFF00',
        'text-primary': '#000000',
        'text-secondary': '#6B7280',
        'input-border': '#E5E7EB',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'welcome-gradient': 'linear-gradient(to bottom, #FFC0CB, #E6E6FA)',
        'brand-gradient': 'linear-gradient(135deg, #FFC0CB, #E6E6FA)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 192, 203, 0.3)',
      },
    },
  },
  plugins: [],
}
