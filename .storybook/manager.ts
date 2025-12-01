import { addons } from '@storybook/addons';
import theme from './theme';

addons.setConfig({
  theme,
  panelPosition: 'bottom',
  enableShortcuts: true,
  showToolbar: true,
  selectedPanel: 'storybook/docs/panel',
  initialActive: 'sidebar',
  sidebar: {
    showRoots: true,
    collapsedRoots: ['Components'],
  },
});