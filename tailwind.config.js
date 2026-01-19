/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        'azure-dragon': {
          DEFAULT: '#003D7A',
          dark: '#001A34',
          light: '#91ACC6',
        },
        'white-smoke': '#F5F5F5',
        'bright-halo': '#FFD166',
        'carbon': '#333333',
        'smudged-lips': '#EF436B',
        // Semantic colors
        primary: '#003D7A',
        secondary: '#91ACC6',
        accent: '#FFD166',
        error: '#EF436B',
        background: '#F5F5F5',
        foreground: '#333333',
      },
      fontFamily: {
        heading: ['Ultra', 'serif'],
        body: ['PT Serif', 'serif'],
        ui: ['Lato', 'sans-serif'],
      },
      fontSize: {
        'h1': ['3.05em', { lineHeight: '1.2', fontWeight: '400' }], // 54.932px
        'h2': ['2.44em', { lineHeight: '1.2', fontWeight: '400' }], // 43.945px
        'h3': ['1.95em', { lineHeight: '1.3', fontWeight: '400' }], // 35.156px
        'h4': ['1.56em', { lineHeight: '1.3', fontWeight: '400' }], // 28.125px
        'h5': ['1.25em', { lineHeight: '1.4', fontWeight: '400' }], // 22.5px
        'body': ['1em', { lineHeight: '1.5', fontWeight: '400' }], // 18px
        'caption': ['0.8em', { lineHeight: '1.5', fontWeight: '400' }], // 14.4px
        'small': ['0.64em', { lineHeight: '1.5', fontWeight: '400' }], // 11.52px
      },
      spacing: {
        'touch': '44px', // Minimum touch target size
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}
