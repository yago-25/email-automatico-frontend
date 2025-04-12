module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  safelist: [
    {
      pattern: /.*\[\S+\]/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
