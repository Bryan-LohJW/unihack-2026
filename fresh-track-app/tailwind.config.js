/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "app-blue": "#E4F5FF",
        "app-white": "#fcfbff",
        "app-brown": "#8A6955",
      },
    },
  },
  plugins: [],
};
