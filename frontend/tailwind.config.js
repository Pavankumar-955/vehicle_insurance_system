/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        display: ['Merriweather', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        ws: {
          50: '#f6fbf8',
          100: '#eaf6ef',
          200: '#cfecd8',
          300: '#b5e2c1',
          400: '#8fd49d',
          500: '#67c376',
          600: '#4aa45a',
          700: '#3a8b46',
          800: '#2b6833',
          900: '#1d4a22'
        },
        neutral: {
          50: '#fafafa',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827'
        },
        accent: {
          50: '#fff8f1',
          100: '#fff1e6',
          200: '#ffe6cc',
          300: '#ffd6a6',
          400: '#ffc07a',
          500: '#ff9f3b',
          600: '#ff8b20',
          700: '#ff7000',
          800: '#cc5600',
          900: '#993f00'
        },
        gold: {
          50: '#fffbf0',
          100: '#fff7e6',
          200: '#ffeccc',
          300: '#ffe0b2',
          400: '#f0c14b',
          500: '#ECB22E',
          600: '#d4a017',
          700: '#b8860b',
          800: '#8b6914',
          900: '#5c450d'
        },
      },
    },
  },
  plugins: [],
}
