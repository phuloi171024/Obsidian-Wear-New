/** @type {import('tailwindcss').Config} */
export default {
  // Mục content này là quan trọng nhất, nó chỉ đường cho Tailwind biết quét các file nào
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}