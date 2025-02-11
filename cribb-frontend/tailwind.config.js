/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    fontFamily: {
      sans: ['"Nunito Sans", serif'], // body
      teko: ['"Teko", serif'], // heading
    },
    extend: {
      backgroundImage: {
        'custom-gradient': 'linear-gradient(65deg, #8ec5fc 0%, #e0c3fc 100%)',
      },
    },
  },
  plugins: [],
}
