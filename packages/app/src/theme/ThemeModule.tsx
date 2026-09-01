import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { ThemeBlueprint } from '@backstage/plugin-app-react';
import { UnifiedThemeProvider } from '@backstage/theme';
import { ksquareDarkTheme, ksquareLightTheme } from './theme';

const lightTheme = ThemeBlueprint.make({
  name: 'ksquare-light',
  params: {
    theme: {
      id: 'ksquare-light',
      title: 'Ksquare IDP (Light)',
      variant: 'light',
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={ksquareLightTheme} children={children} />
      ),
    },
  },
});

const darkTheme = ThemeBlueprint.make({
  name: 'ksquare-dark',
  params: {
    theme: {
      id: 'ksquare-dark',
      title: 'Ksquare IDP (Dark)',
      variant: 'dark',
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={ksquareDarkTheme} children={children} />
      ),
    },
  },
});

export const themeModule = createFrontendModule({
  pluginId: 'app',
  extensions: [lightTheme, darkTheme],
});
