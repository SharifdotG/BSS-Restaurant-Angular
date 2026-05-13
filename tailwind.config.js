/** @type {import('tailwindcss').Config} */
export const content = ['./src/**/*.{html,ts}', './node_modules/flowbite/**/*.js'];
export const darkMode = ['class', '[data-theme="dark"]'];
export const theme = {
  extend: {
    fontFamily: {
      sans: ['Geist', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      display: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
      mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
    },
    colors: {
      canvas: 'var(--ds-canvas)',
      'canvas-soft': 'var(--ds-canvas-soft)',
      'canvas-soft-2': 'var(--ds-canvas-soft-2)',
      ink: 'var(--ds-ink)',
      'on-primary': 'var(--ds-on-primary)',
      body: 'var(--ds-body)',
      mute: 'var(--ds-mute)',
      hairline: 'var(--ds-hairline)',
      'hairline-strong': 'var(--ds-hairline-strong)',
      link: 'var(--ds-link)',
      'link-deep': 'var(--ds-link-deep)',
      success: 'var(--ds-success)',
      error: 'var(--ds-error)',
      warning: 'var(--ds-warning)',
      violet: 'var(--ds-violet)',
      cyan: 'var(--ds-cyan)',
    },
    borderRadius: {
      'ds-sm': 'var(--ds-radius-sm)',
      'ds-md': 'var(--ds-radius-md)',
      'ds-lg': 'var(--ds-radius-lg)',
      'ds-xl': 'var(--ds-radius-xl)',
      'ds-pill': 'var(--ds-radius-pill)',
      'ds-pill-sm': 'var(--ds-radius-pill-sm)',
    },
    boxShadow: {
      'ds-1': 'var(--ds-shadow-1)',
      'ds-2': 'var(--ds-shadow-2)',
      'ds-3': 'var(--ds-shadow-3)',
      'ds-4': 'var(--ds-shadow-4)',
      'ds-5': 'var(--ds-shadow-5)',
    },
  },
};
export const plugins = [require('flowbite/plugin')];
