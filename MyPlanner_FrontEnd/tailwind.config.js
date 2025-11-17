
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette teal per login
        'login-bg': '#22C7B7',
        'login-card': '#20BFAE',
        'login-card-light': '#2CD5C3',
        'login-highlight': '#F3B521',
        'login-text': '#FFFFFF',
        // Palette dashboard
        'dash-bg': '#EEF1F7',
        'dash-card': '#FFFFFF',
        'dash-border': '#E4E8F2',
        'dash-muted': '#9AA4BF',
        'dash-primary': '#1E1E2F',
        // Task colors
        'task-green': '#39D77D',
        'task-purple': '#7A5BFF',
        'task-orange': '#F97316',
        'task-cyan': '#22A7F0',
        'task-pink': '#FF6BB5',
        'task-yellow': '#FACC15',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'dash': '0 24px 60px rgba(15, 37, 64, 0.08)',
        'login-card': '0 28px 80px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        'xl': '24px',
        '2xl': '32px',
      },
    },
  },
  plugins: [],
}

