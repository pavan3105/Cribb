/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js" 
  ],
  theme: {
    fontFamily: {
      sans: ['"Nunito Sans", serif'],
      teko: ['"Teko", serif'],
    },
    extend: {
      backgroundImage: {
        'custom-gradient': 'linear-gradient(65deg, #8ec5fc 0%, #e0c3fc 100%)',
      },
    },
  },
  plugins: [
    require('flowbite/plugin') 
  ],
}
