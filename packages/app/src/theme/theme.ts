import {
  createUnifiedTheme,
  genPageTheme,
  palettes,
  shapes,
  UnifiedTheme,
} from '@backstage/theme';

// The Ksquare Group palette: brand navy chrome with a blue accent. The
// accent is used for links/highlights/active states; it switches shade
// between light and dark mode so it always stays readable (WCAG AA):
// the deeper accent blue reads fine on white, but is too dark to read on a
// near-black surface, where the brighter blue is used instead.
export const ksquareColors = {
  navy: '#1C3A63',
  navyElevated: '#25497E',
  navyDeep: '#132A4A',
  accentLight: '#2F6DB8',
  accentDark: '#6BA3E0',
};

// A single, consistent navy -> blue page header is used everywhere,
// regardless of entity type, so the whole portal reads as one branded
// product rather than a grab-bag of default Backstage colors.
const ksquarePageTheme = genPageTheme({
  colors: [ksquareColors.navy, ksquareColors.accentLight],
  shape: shapes.wave,
  options: { fontColor: '#FFFFFF' },
});

const pageThemeOverrides = {
  home: ksquarePageTheme,
  documentation: ksquarePageTheme,
  tool: ksquarePageTheme,
  service: ksquarePageTheme,
  website: ksquarePageTheme,
  library: ksquarePageTheme,
  other: ksquarePageTheme,
  app: ksquarePageTheme,
  apis: ksquarePageTheme,
  card: ksquarePageTheme,
};

// The sidebar is always navy (both modes) - it's the app's persistent brand
// chrome. Its text/icons are always light, and its active-state accent is
// always the brighter blue, since that surface is always dark regardless of
// which content theme is active.
const navigationPalette = {
  background: ksquareColors.navy,
  color: '#E8E8E8',
  indicator: ksquareColors.accentDark,
  selectedColor: ksquareColors.accentDark,
  navItem: {
    hoverBackground: ksquareColors.navyElevated,
  },
  submenu: {
    background: ksquareColors.navyDeep,
  },
};

export const ksquareLightTheme: UnifiedTheme = createUnifiedTheme({
  palette: {
    ...palettes.light,
    primary: {
      main: ksquareColors.navy,
      dark: ksquareColors.navyDeep,
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    // Accent blue reads fine as link text on white (passes WCAG AA).
    link: ksquareColors.accentLight,
    linkHover: ksquareColors.navy,
    border: '#DCE3EC',
    navigation: {
      ...palettes.light.navigation,
      ...navigationPalette,
    },
    pinSidebarButton: {
      icon: ksquareColors.navy,
      background: ksquareColors.accentDark,
    },
    tabbar: {
      indicator: ksquareColors.accentLight,
    },
  },
  defaultPageTheme: 'home',
  pageTheme: pageThemeOverrides,
});

export const ksquareDarkTheme: UnifiedTheme = createUnifiedTheme({
  palette: {
    ...palettes.dark,
    primary: {
      main: ksquareColors.navy,
      dark: ksquareColors.navyDeep,
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0B1220',
      paper: '#121A2B',
    },
    // The deep navy is too dark to read on a near-black surface, so dark
    // mode uses the brighter accent blue for links instead.
    link: ksquareColors.accentDark,
    linkHover: ksquareColors.accentLight,
    border: '#24344E',
    navigation: {
      ...palettes.dark.navigation,
      ...navigationPalette,
    },
    pinSidebarButton: {
      icon: ksquareColors.navy,
      background: ksquareColors.accentDark,
    },
    tabbar: {
      indicator: ksquareColors.accentDark,
    },
  },
  defaultPageTheme: 'home',
  pageTheme: pageThemeOverrides,
});
