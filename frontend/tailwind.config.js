/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Arial"],
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.06)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(10px)", filter: "blur(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)", filter: "blur(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s linear infinite",
        floaty: "floaty 4s ease-in-out infinite",
        fadeUp: "fadeUp 0.5s ease-out both",
      },
      colors: {
        brand: {
          50: "#fff1f2",
          100: "#ffe4e6",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
      },
    },
  },
  plugins: [],
};
