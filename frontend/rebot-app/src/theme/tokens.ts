export const colors = {
  background: '#FFFFFF', text: '#111111', muted: '#9EA3B2', subtle: '#B4B4C5',
  border: '#E5E5EC', surface: '#F7F7F8', surfaceStrong: '#F2F2F4',
  accent: '#FDE68A', accentSoft: '#FFF5CB', warningSoft: '#FFFAE8',
  black: '#000000', white: '#FFFFFF',
} as const;

export const spacing = { xs: 6, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { sm: 12, md: 16, lg: 22, pill: 999 } as const;
export const typography = {
  title: { fontSize: 28, lineHeight: 40, fontWeight: '700' as const },
  heading: { fontSize: 20, lineHeight: 30, fontWeight: '700' as const },
  subheading: { fontSize: 18, lineHeight: 26, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
  caption: { fontSize: 13, lineHeight: 22, fontWeight: '400' as const },
} as const;
