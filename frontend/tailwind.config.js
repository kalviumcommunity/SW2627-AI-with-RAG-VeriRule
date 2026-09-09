/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional Blue Palette (Enterprise)
        primary: {
          50: '#F0F4FF',
          100: '#E6EDFF',
          200: '#C7D9FF',
          300: '#A8C5FF',
          400: '#7BA5FF',
          500: '#4D85FF', // Main primary
          600: '#3B5FE6',
          700: '#2939CC',
          800: '#1A23A3',
          900: '#0D127A',
        },
        // Accent Teal (Compliance/Security)
        accent: {
          50: '#F0FDFC',
          100: '#E0FBF8',
          200: '#B3F3ED',
          300: '#86ECE4',
          400: '#44DDD6',
          500: '#14B8A6', // Main accent
          600: '#0D9488',
          700: '#0A6F6F',
          800: '#075656',
          900: '#053D3D',
        },
        // Neutral Gray Palette
        neutral: {
          50: '#FAFBFC',
          100: '#F3F4F6',
          150: '#EEEFF2',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Status Colors
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
        // Additional
        secondary: '#7C3AED',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#1F2937',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        },
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'elevation-1': '0 2px 8px rgba(15, 23, 42, 0.08)',
        'elevation-2': '0 4px 16px rgba(15, 23, 42, 0.12)',
        'elevation-3': '0 8px 24px rgba(15, 23, 42, 0.15)',
        'glow-primary': '0 0 20px rgba(77, 133, 255, 0.15)',
        'glow-accent': '0 0 20px rgba(20, 184, 166, 0.15)',
      },
      borderRadius: {
        'none': '0',
        'xs': '6px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
