import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './remotion/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'unfocused-border-color': 'var(--unfocused-border-color)',
        'focused-border-color': 'var(--focused-border-color)',

        'button-disabled-color': 'var(--button-disabled-color)',
        'disabled-text-color': 'var(--disabled-text-color)',

        'geist-error': 'var(--geist-error)',

        subtitle: 'var(--subtitle)',
      },
      fontSize: {
        xl: ['2.5rem', { lineHeight: '3rem' }],
        '2xl': ['3rem', { lineHeight: '3.5rem' }],
        '3xl': ['4rem', { lineHeight: '4.5rem' }],
        '4xl': ['5rem', { lineHeight: '5.5rem' }],
        '5xl': ['6rem', { lineHeight: '6.5rem' }],
      },
      padding: {
        'geist-quarter': 'var(--geist-quarter-pad)',
        'geist-half': 'var(--geist-half-pad)',
        geist: 'var(--geist-pad)',
      },
      spacing: {
        'geist-quarter': 'var(--geist-quarter-pad)',
        'geist-half': 'var(--geist-half-pad)',
        geist: 'var(--geist-pad)',
      },

      borderRadius: {
        geist: 'var(--geist-border-radius)',
      },

      fontFamily: {
        geist: 'var(--geist-font)',
      },

      animation: {
        spinner: 'spinner 1.2s linear infinite',
      },

      keyframes: {
        spinner: {
          '0%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0.15',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
