/**
 * WARM_EARTHY preset with the Domino Rail Chain brand overrides.
 * The `name` field stays exactly as in preset.ts.
 */
/** Kept outside the `as const` object: LinearGradient needs a mutable array. */
const gradients: Record<string, string[]> = {
    loader: ['#1D2418', '#47543F', '#1D2418'],
    menu: ['#F1F6ED', '#FAF5EC', '#B0DDB4'],
    game: ['#F1F6ED', '#FAF5EC', '#E8DDC4'],
    replay: ['#E8DDC4', '#F1F6ED', '#B0DDB4'],
    win: ['#B0DDB4', '#F1F6ED', '#FAF5EC'],
    lose: ['#F1F6ED', '#E8DDC4', '#FAF5EC'],
    medals: ['#FAF5EC', '#F1F6ED', '#E8DDC4'],
    catalog: ['#F1F6ED', '#B0DDB4', '#FAF5EC'],
    header: ['#1D2418', '#47543F'],
    action: ['#E028CE', '#F06BDD'],
    green: ['#5BAB2A', '#B0DDB4'],
    wood: ['#E8DDC4', '#D8C9A8'],
    ivory: ['#FFFFFF', '#F2EAD8'],
    progress: ['#5BAB2A', '#B0DDB4'],
};

export const theme = {
  name: 'warm-earthy',

  colors: {
    background: '#F1F6ED',
    primary: '#5BAB2A',
    primarySoft: '#B0DDB4',
    accent: '#E028CE',
    accentHighlight: '#F06BDD',
    secondary: '#B0DDB4',
    surface: '#FAF5EC',
    surfaceWarm: '#F2EAD8',
    woodLight: '#E8DDC4',
    woodEdge: '#D8C9A8',
    walnut: '#6B5740',
    brass: '#D97B4D',
    ink: '#1D2418',
    inkMid: '#47543F',

    text: {
      primary: '#1D2418',
      secondary: '#47543F',
      tertiary: '#596550',
      inverse: '#F1F6ED',
      onDarkMuted: '#B0DDB4',
    },

    ui: {
      border: '#D8C9A8',
      divider: '#E8DDC4',
      hairline: 'rgba(29, 36, 24, 0.10)',
      highlight: 'rgba(255, 255, 255, 0.55)',
      overlay: 'rgba(29, 36, 24, 0.30)',
      glass: 'rgba(250, 245, 236, 0.88)',
      inset: 'rgba(29, 36, 24, 0.06)',
    },

    medal: {
      gold: '#D9B36C',
      silver: '#AEB9A6',
      bronze: '#D97B4D',
      none: '#A89B82',
    },

    state: {
      good: '#5BAB2A',
      warn: '#D9B36C',
      quiet: '#A89B82',
    },
  },

  gradients,

  typography: {
    hero: { fontSize: 40, lineHeight: 44, fontWeight: '800' as const, letterSpacing: 0.2 },
    screenTitle: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
    sectionTitle: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const },
    button: { fontSize: 20, lineHeight: 24, fontWeight: '700' as const },
    buttonSmall: { fontSize: 15, lineHeight: 24, fontWeight: '700' as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: '400' as const },
    helper: { fontSize: 15, lineHeight: 20, fontWeight: '500' as const },
    stat: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const, letterSpacing: 1 },
  },

  radius: { sm: 8, md: 12, lg: 16, sheet: 18, full: 999 },

  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },

  shadows: {
    piece: {
      shadowColor: '#1D2418',
      shadowOpacity: 0.16,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    card: {
      shadowColor: '#1D2418',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    board: {
      shadowColor: '#1D2418',
      shadowOpacity: 0.16,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    action: {
      shadowColor: '#E028CE',
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
    sheet: {
      shadowColor: '#1D2418',
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: -4 },
      elevation: 10,
    },
  },
} as const;

export type Theme = typeof theme;
export default theme;
