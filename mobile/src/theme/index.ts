import { MD3LightTheme } from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Bright Cream Retro Video Store Palette
    primary: '#D35400', // Burnt orange (main accent)
    primaryContainer: '#F5A623', // Warm amber for containers
    secondary: '#3E8E5E', // Muted forest green
    secondaryContainer: '#A8D8B9',
    background: '#FFF6EC', // Bright warm cream (main bg)
    surface: '#FFF0E0', // Soft peach cream (cards/surfaces)
    surfaceVariant: '#F5E1CC', // Warm beige for variants
    onPrimary: '#FFFFFF', // White text on orange
    onSecondary: '#FFFFFF', // White text on green
    onBackground: '#2C1810', // Dark brown (primary text)
    onSurface: '#2C1810', // Dark brown
    onSurfaceVariant: '#6B4423', // Medium brown (secondary text)
    outline: '#D4B896', // Warm tan (borders/dividers)
    error: '#C0392B', // Deep red for errors
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: 'transparent',
      level1: '#FFF0E0',
      level2: '#F5E1CC',
      level3: '#EBD2B4',
      level4: '#E0C39C',
      level5: '#D4B896',
    },
  },
  fonts: {
    ...MD3LightTheme.fonts,
  },
};

// Export additional theme values for custom components
export const customTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  // Retro-specific colors
  retro: {
    shelfBrown: '#8B6914', // Warm wooden shelf
    caseShadow: '#00000015', // Subtle shadow for depth
    labelYellow: '#F4D03F', // Vintage label color
    stampRed: '#C0392B', // Red stamp/badge color
    neonOrange: '#D35400', // Warm orange accent
    warmGlow: '#F5A623', // Warm amber glow
    vinylBlack: '#2C1810', // Dark brown for contrast
    paperCream: '#FFF6EC', // Bright cream
  },
};

export default theme;
