import { MD3DarkTheme } from 'react-native-paper';

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Dark Indie Video Store Palette
    primary: '#E67E22',           // Burnt orange (main accent - pops on dark)
    primaryContainer: '#A04000',  // Darker orange for containers
    secondary: '#52BE80',         // Forest green (secondary accent)
    secondaryContainer: '#27AE60',
    background: '#1A0F0A',        // Deep dark brown (main bg)
    surface: '#2C1810',           // Dark chocolate brown (cards/surfaces)
    surfaceVariant: '#3D2415',    // Medium brown for variants
    onPrimary: '#FFFFFF',         // White text on orange
    onSecondary: '#1A0F0A',       // Dark text on green
    onBackground: '#F5E6D3',      // Warm cream (primary text)
    onSurface: '#F5E6D3',         // Warm cream
    onSurfaceVariant: '#D4C5B0',  // Tan (secondary text)
    outline: '#6B4423',           // Brown (borders/dividers)
    error: '#E74C3C',             // Warm red for errors
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level0: 'transparent',
      level1: '#2C1810',
      level2: '#3D2415',
      level3: '#4D2E1A',
      level4: '#5D3820',
      level5: '#6B4423',
    },
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    // Custom fonts will be added after we install them
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
    shelfBrown: '#4D2E1A',        // Dark wooden shelf
    caseShadow: '#00000040',      // Shadow for depth
    labelYellow: '#F4D03F',       // Vintage label color
    stampRed: '#E74C3C',          // Red stamp/badge color
    neonOrange: '#FF6B35',        // Neon sign glow
    warmGlow: '#FFA500',          // Warm light effect
    vinylBlack: '#0A0503',        // Deep black for backgrounds
    paperCream: '#F5E6D3',        // Aged paper color
  },
};

export default theme;