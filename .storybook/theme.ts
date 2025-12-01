import { create } from '@storybook/theming';

export default create({
  base: 'light',
  brandTitle: 'AutoFund AI',
  brandUrl: 'https://autofund.ai',
  brandImage: 'https://img.icons8.com/color/96/000000/artificial-intelligence.png',
  brandTarget: '_self',
  // Theme colors
  colorPrimary: '#3b82f6',
  colorSecondary: '#6366f1',
  // UI
  appBg: '#ffffff',
  appContentBg: '#ffffff',
  appBorderColor: '#e5e7eb',
  appBorderRadius: 8,
  // Typography
  fontBase: '"Inter", sans-serif',
  fontCode: '"JetBrains Mono", monospace',
  // Text colors
  textColor: '#111827',
  textInverseColor: '#ffffff',
  textMutedColor: '#6b7280',
  // Bar colors
  barTextColor: '#111827',
  barSelectedColor: '#3b82f6',
  barBg: '#ffffff',
  // Form colors
  inputBg: '#ffffff',
  inputBorder: '#d1d5db',
  inputTextColor: '#111827',
  inputBorderColor: '#d1d5db',
  // State colors
  colorPositive: '#10b981',
  colorNegative: '#ef4444',
  colorWarning: '#f59e0b',
  // Addon colors
  addonBg: '#f9fafb',
  addonHoverBg: '#f3f4f6',
});