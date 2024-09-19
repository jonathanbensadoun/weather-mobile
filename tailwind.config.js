/ @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src//*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        celadon: "#77d7c9",
        lavande: "#c89eff",
        celeste: "#bbdcff",
      },
      animation: {
        "slide-down": "slideDown 1s ease-in-out",
        "slide-up": "slideUp 1s ease-in-out",
        opacity: "opacity 0.5s ease-in-out",
        blink: "blink 2s linear infinite ",
        bounce: "bounce 4s ease-in-out infinite",
        bounce200: "bounce 1s infinite 200ms",
        bounce400: "bounce 1s infinite 400ms",
      },
    },
  },
  plugins: [],
};