/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1769E8',
          hover: '#1358C2',
          light: '#EFF6FF',
          muted: 'rgba(23, 105, 232, 0.12)',
        },
        navy: {
          DEFAULT: '#1769E8',
          dark: '#0B111E',
          secondary: '#1D293B',
          light: '#2563EB',
        },
        teal: {
          DEFAULT: '#14B8A6',
          hover: '#0D9488',
          light: '#F0FDFA',
          muted: 'rgba(20, 184, 166, 0.12)',
        },
        brand: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          textPrimary: '#172338',
          textSecondary: '#64748B',
          textTertiary: '#94A3B8',
          border: '#E2E8F0',
          success: '#16A34A',
          error: '#DC2626',
          warning: '#F59E0B',
          // Compatibility
          primary: '#1769E8',
          accent: '#14B8A6',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        'clean': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'card': '0 2px 8px rgba(20, 34, 53, 0.06)',
        'elevated': '0 8px 24px rgba(20, 34, 53, 0.08)',
      },
    },
  },
  plugins: [],
};

