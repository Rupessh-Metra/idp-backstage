import {
  createUnifiedTheme,
  genPageTheme,
  palettes,
  shapes,
  UnifiedTheme,
} from '@backstage/theme';

// Ben 10 / Omnitrix inspired palette: black/near-black chrome with a lime
// green accent. The accent is used for buttons, links, and active states;
// it is never used as body text on a light background (fails contrast).
export const ksquareColors = {
  accent: '#8CC63F',
  accentBright: '#A2E037',
  accentDark: '#6EA032',
  black: '#0D0D0D',
  blackAlt: '#141414',
  blackElevated: '#1B1B1B',
};

// A single, consistent black + lime-green page header is used everywhere,
// regardless of entity type, so the whole portal reads as one branded
// product rather than a grab-bag of default Backstage colors.
const omnitrixPageTheme = genPageTheme({
  colors: [ksquareColors.black, '#1F3D0F'],
  shape: shapes.wave,
  options: { fontColor: ksquareColors.accentBright },
});

const pageThemeOverrides = {
  home: omnitrixPageTheme,
  documentation: omnitrixPageTheme,
  tool: omnitrixPageTheme,
  service: omnitrixPageTheme,
  website: omnitrixPageTheme,
  library: omnitrixPageTheme,
  other: omnitrixPageTheme,
  app: omnitrixPageTheme,
  apis: omnitrixPageTheme,
  card: omnitrixPageTheme,
};

export const ksquareLightTheme: UnifiedTheme = createUnifiedTheme({
  palette: {
    ...palettes.light,
    primary: {
      main: ksquareColors.accent,
      dark: ksquareColors.accentDark,
      contrastText: ksquareColors.black,
    },
    background: {
      default: '#F7F8F5',
      paper: '#FFFFFF',
    },
    // Reserve the bright green for accents/buttons/active states only - body
    // links use a darker shade so they stay readable (WCAG AA) on white.
    link: '#4C7A1F',
    linkHover: '#3A5F17',
    border: '#DCDCDC',
    navigation: {
      ...palettes.light.navigation,
      background: ksquareColors.black,
      color: '#E8E8E8',
      indicator: ksquareColors.accentBright,
      selectedColor: ksquareColors.accentBright,
      navItem: {
        hoverBackground: ksquareColors.blackElevated,
      },
      submenu: {
        background: ksquareColors.blackAlt,
      },
    },
    pinSidebarButton: {
      icon: ksquareColors.black,
      background: ksquareColors.accent,
    },
    tabbar: {
      indicator: ksquareColors.accent,
    },
  },
  defaultPageTheme: 'home',
  pageTheme: pageThemeOverrides,
});

export const ksquareDarkTheme: UnifiedTheme = createUnifiedTheme({
  palette: {
    ...palettes.dark,
    primary: {
      main: ksquareColors.accent,
      dark: ksquareColors.accentDark,
      contrastText: ksquareColors.black,
    },
    background: {
      default: ksquareColors.black,
      paper: ksquareColors.blackAlt,
    },
    // On black, the bright accent reads fine as link text too.
    link: ksquareColors.accentBright,
    linkHover: ksquareColors.accent,
    border: '#2A2A2A',
    navigation: {
      ...palettes.dark.navigation,
      background: ksquareColors.black,
      color: '#E8E8E8',
      indicator: ksquareColors.accentBright,
      selectedColor: ksquareColors.accentBright,
      navItem: {
        hoverBackground: ksquareColors.blackElevated,
      },
      submenu: {
        background: ksquareColors.blackAlt,
      },
    },
    pinSidebarButton: {
      icon: ksquareColors.black,
      background: ksquareColors.accent,
    },
    tabbar: {
      indicator: ksquareColors.accent,
    },
  },
  defaultPageTheme: 'home',
  pageTheme: pageThemeOverrides,
});
