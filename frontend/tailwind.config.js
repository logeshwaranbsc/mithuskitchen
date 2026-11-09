/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7FAF7',
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#237A45',
          dark: '#185C35',
          light: '#EAF5EC',
          hover: '#1b6338',
        },
        text: {
          main: '#202820',
          secondary: '#6B756D',
          muted: '#8F9991',
        },
        border: {
          DEFAULT: '#E5EAE5',
          light: '#F0F4F0',
        },
        status: {
          confirmed: '#237A45',
          preparing: '#D97706',
          outForDelivery: '#2563EB',
          delivered: '#15803D',
          cancelled: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(35, 122, 69, 0.05)',
        'soft-lg': '0 10px 25px rgba(35, 122, 69, 0.08)',
        'soft-xl': '0 20px 35px rgba(35, 122, 69, 0.12)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
      }
    },
  },
  plugins: [],
}
