/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'domus-primary': '#274181',
        'domus-secondary': '#95CDD1',
        'domus-accent': '#F6963F',
        'domus-danger': '#D95766',
        'domus-info': '#0DC0E8',
        'domus-light': '#F5F2F2',
      },
    },
  },
  plugins: [],
}
