/** @type {import('tailwindcss').Config} */
export const content = ['./src/**/*.{html,ts}', './node_modules/flowbite/**/*.js'];
export const theme = {
  extend: {
    fontFamily: {
      sans: ['Work Sans', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      display: ['Poppins', 'Work Sans', 'system-ui', 'sans-serif'],
    },
  },
};
export const plugins = [require('flowbite/plugin')];
