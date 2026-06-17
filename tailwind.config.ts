import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'surface': 'var(--color-surface)',
        'secondary': 'var(--color-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'accent-soft': 'var(--color-accent-soft)',
        'highlight': 'var(--color-highlight)',
        'accent': 'var(--color-accent)',
        'text-primary': 'var(--color-text-primary)',
        'success': { DEFAULT: '#10B981', muted: 'rgba(16, 185, 129, 0.15)' },
        'warning': { DEFAULT: '#F59E0B', muted: 'rgba(245, 158, 11, 0.15)' },
        'destructive': { DEFAULT: '#EF4444', muted: 'rgba(239, 68, 68, 0.15)' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'elevated': 'var(--shadow-elevated)',
        'glow': '0 0 12px rgba(192, 132, 160, 0.3)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
      },
      maxWidth: {
        'content': '1280px',
      },
    },
  },
  plugins: [],
};

export default config;
