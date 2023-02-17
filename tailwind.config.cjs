/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      display: ["Rubik", "sans-serif"],
    },
    extend: {
      colors: {
        primary: {
          '50': '#E9EEF9',
          '100': '#D4DEF1',
          '200': '#BCCCEB', 
          '300': '#9DB6E6',
          '400': '#789CE0',
          '500': '#5C8CE9',
          '600': '#3973E4',
          '700': '#1952C4',
          '800': '#1541A6',
          '900': '#083499',
        },
        secondary: {
          '50': '#E9F1F3',
          '100': '#C7DADE',
          '200': '#99B7BE',
          '300': '#699AA4',
          '400': '#689099',
          '500': '#4A757E',
          '600': '#44676E',
          '700': '#45595D',
          '800': '#2E3A3C',
          '900': '#1A2224',
        }
      }
    },
  },
  plugins: [],
};
