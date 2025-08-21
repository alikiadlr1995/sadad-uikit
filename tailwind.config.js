/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",   // همه فایل‌های پروژه
    "./.storybook/**/*.{js,ts,jsx,tsx,mdx}" // استوری‌بوک
  ],
  theme: {
    extend: {},
  },
  corePlugins: { preflight: false },
  plugins: [],
};
