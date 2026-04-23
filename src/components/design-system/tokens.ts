// Palette aligned with docs/design/DESIGN_REQUIREMENTS.md v2.1
export const K = {
  white:       '#FFFFFF',
  paper:       '#F7F8FA',              // Surface — neutral light
  paper2:      '#ECEDF1',              // Surface-2 — neutral secondary
  bone:        '#ECEDF1',              // subtle bg for inactive/soft states
  ink:         '#0E1116',              // Ink 100%
  ink2:        'rgba(14,17,22,0.70)',  // Ink-70 (secondary text)
  muted:       'rgba(14,17,22,0.50)',  // Ink-50 (captions)
  muted2:      'rgba(14,17,22,0.30)',  // Ink-30
  line:        'rgba(14,17,22,0.30)',  // Ink-30 (borders)
  lineSoft:    'rgba(14,17,22,0.08)',  // Ink-10 (light fill)

  mint:        '#14B88A',              // Green (brand)
  mintSoft:    '#C5F0E0',              // Green-soft
  mintInk:     '#004F3E',

  blue:        '#3D5BE6',              // Blue (brand)
  blueSoft:    '#D6DEFB',              // Blue-soft
  blueInk:     '#0D1E6B',

  violet:      '#8A4AE0',              // Purple (brand)
  violetSoft:  '#E3D2F8',              // Purple-soft
  violetInk:   '#2A0F6B',

  orange:      '#FF6A2C',              // Orange (brand)
  orangeSoft:  '#FFE2D1',              // Orange-soft

  good:        '#14B88A',              // semantic success
  warn:        '#FFB020',              // semantic warning
  bad:         '#FF5A5A',              // semantic error
} as const
