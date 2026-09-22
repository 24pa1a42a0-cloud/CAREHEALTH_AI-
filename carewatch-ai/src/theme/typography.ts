export const fonts = {
  fraunces: {
    regular: 'Fraunces_400Regular',
    semiBold: 'Fraunces_600SemiBold',
    bold: 'Fraunces_700Bold',
  },
  inter: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  spaceGrotesk: {
    regular: 'SpaceGrotesk_400Regular',
    medium: 'SpaceGrotesk_500Medium',
    bold: 'SpaceGrotesk_700Bold',
  },
};

export const typography = {
  hero: {
    fontFamily: fonts.fraunces.bold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  title1: {
    fontFamily: fonts.fraunces.bold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  title2: {
    fontFamily: fonts.fraunces.semiBold,
    fontSize: 20,
    lineHeight: 26,
  },
  title3: {
    fontFamily: fonts.fraunces.semiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  bodyLarge: {
    fontFamily: fonts.inter.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  labelBold: {
    fontFamily: fonts.inter.bold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  labelMedium: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  metricLarge: {
    fontFamily: fonts.spaceGrotesk.bold,
    fontSize: 32,
    lineHeight: 36,
  },
  metricMedium: {
    fontFamily: fonts.spaceGrotesk.bold,
    fontSize: 22,
    lineHeight: 26,
  },
  metricSmall: {
    fontFamily: fonts.spaceGrotesk.medium,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.5,
  },
  code: {
    fontFamily: fonts.spaceGrotesk.regular,
    fontSize: 12,
    lineHeight: 16,
  },
};
