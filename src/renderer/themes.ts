export interface Theme {
  id: string
  name: string
  colors: {
    bgBase: string
    bgElevated: string
    bgSurface: string
    bgHover: string
    bgActive: string
    borderSubtle: string
    borderDefault: string
    borderStrong: string
    textPrimary: string
    textSecondary: string
    textTertiary: string
    textMuted: string
    accent: string
    accentHover: string
    accentSubtle: string
    accentGlow: string
    success: string
    successSubtle: string
    info: string
    infoSubtle: string
  }
  terminal: {
    background: string
    foreground: string
    cursor: string
    cursorAccent: string
    selection: string
    black: string
    red: string
    green: string
    yellow: string
    blue: string
    magenta: string
    cyan: string
    white: string
    brightBlack: string
    brightRed: string
    brightGreen: string
    brightYellow: string
    brightBlue: string
    brightMagenta: string
    brightCyan: string
    brightWhite: string
  }
}

export const themes: Theme[] = [
  {
    id: 'default',
    name: 'Dark',
    colors: {
      bgBase: '#0d0d0f',
      bgElevated: '#141417',
      bgSurface: '#1a1a1f',
      bgHover: '#222228',
      bgActive: '#2a2a32',
      borderSubtle: 'rgba(255, 255, 255, 0.06)',
      borderDefault: 'rgba(255, 255, 255, 0.1)',
      borderStrong: 'rgba(255, 255, 255, 0.15)',
      textPrimary: '#e8e8ed',
      textSecondary: '#9898a0',
      textTertiary: '#606068',
      textMuted: '#48484f',
      accent: '#e87c45',
      accentHover: '#f08d58',
      accentSubtle: 'rgba(232, 124, 69, 0.15)',
      accentGlow: 'rgba(232, 124, 69, 0.4)',
      success: '#4ade80',
      successSubtle: 'rgba(74, 222, 128, 0.15)',
      info: '#60a5fa',
      infoSubtle: 'rgba(96, 165, 250, 0.15)',
    },
    terminal: {
      background: '#141417',
      foreground: '#e8e8ed',
      cursor: '#e87c45',
      cursorAccent: '#141417',
      selection: 'rgba(232, 124, 69, 0.3)',
      black: '#1a1a1f',
      red: '#f14c4c',
      green: '#4ade80',
      yellow: '#fbbf24',
      blue: '#60a5fa',
      magenta: '#c084fc',
      cyan: '#22d3ee',
      white: '#e8e8ed',
      brightBlack: '#606068',
      brightRed: '#f87171',
      brightGreen: '#86efac',
      brightYellow: '#fcd34d',
      brightBlue: '#93c5fd',
      brightMagenta: '#d8b4fe',
      brightCyan: '#67e8f9',
      brightWhite: '#ffffff',
    },
  },
  {
    id: 'light',
    name: 'Light',
    colors: {
      bgBase: '#ffffff',
      bgElevated: '#f8f9fa',
      bgSurface: '#f1f3f4',
      bgHover: '#e8eaed',
      bgActive: '#dadce0',
      borderSubtle: 'rgba(0, 0, 0, 0.08)',
      borderDefault: 'rgba(0, 0, 0, 0.12)',
      borderStrong: 'rgba(0, 0, 0, 0.2)',
      textPrimary: '#1a1a1a',
      textSecondary: '#5f6368',
      textTertiary: '#80868b',
      textMuted: '#bdc1c6',
      accent: '#1a73e8',
      accentHover: '#1967d2',
      accentSubtle: 'rgba(26, 115, 232, 0.1)',
      accentGlow: 'rgba(26, 115, 232, 0.25)',
      success: '#1e8e3e',
      successSubtle: 'rgba(30, 142, 62, 0.1)',
      info: '#1a73e8',
      infoSubtle: 'rgba(26, 115, 232, 0.1)',
    },
    terminal: {
      background: '#f8f9fa',
      foreground: '#1a1a1a',
      cursor: '#1a73e8',
      cursorAccent: '#f8f9fa',
      selection: 'rgba(26, 115, 232, 0.2)',
      black: '#1a1a1a',
      red: '#d93025',
      green: '#1e8e3e',
      yellow: '#f9ab00',
      blue: '#1a73e8',
      magenta: '#a142f4',
      cyan: '#007b83',
      white: '#f1f3f4',
      brightBlack: '#5f6368',
      brightRed: '#ea4335',
      brightGreen: '#34a853',
      brightYellow: '#fbbc04',
      brightBlue: '#4285f4',
      brightMagenta: '#af5cf7',
      brightCyan: '#24c1e0',
      brightWhite: '#ffffff',
    },
  },
  {
    id: 'sakura',
    name: 'RGB Gamer',
    colors: {
      bgBase: '#0d0a12',
      bgElevated: '#13101a',
      bgSurface: '#1a1522',
      bgHover: '#231c2e',
      bgActive: '#2c233a',
      borderSubtle: 'rgba(255, 0, 128, 0.2)',
      borderDefault: 'rgba(255, 0, 128, 0.35)',
      borderStrong: 'rgba(255, 0, 128, 0.5)',
      textPrimary: '#fff0f5',
      textSecondary: '#ff99cc',
      textTertiary: '#cc66aa',
      textMuted: '#884488',
      accent: '#ff1493',
      accentHover: '#ff69b4',
      accentSubtle: 'rgba(255, 20, 147, 0.25)',
      accentGlow: 'rgba(255, 20, 147, 0.6)',
      success: '#00ff88',
      successSubtle: 'rgba(0, 255, 136, 0.25)',
      info: '#00ffff',
      infoSubtle: 'rgba(0, 255, 255, 0.25)',
    },
    terminal: {
      background: '#13101a',
      foreground: '#fff0f5',
      cursor: '#ff1493',
      cursorAccent: '#13101a',
      selection: 'rgba(255, 20, 147, 0.4)',
      black: '#1a1522',
      red: '#ff6b9d',
      green: '#00ff88',
      yellow: '#ffff00',
      blue: '#00bfff',
      magenta: '#ff00ff',
      cyan: '#00ffff',
      white: '#fff0f5',
      brightBlack: '#884488',
      brightRed: '#ff99b3',
      brightGreen: '#66ffaa',
      brightYellow: '#ffff66',
      brightBlue: '#66d9ff',
      brightMagenta: '#ff66ff',
      brightCyan: '#66ffff',
      brightWhite: '#ffffff',
    },
  },
  // === FATIGUE-REDUCING THEMES ===

  // Solarized Dark - CIELAB-optimized palette with fixed lightness relationships
  // Philosophy: Scientific color relationships that minimize eye strain through
  // precisely calibrated contrast ratios and color harmony
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    colors: {
      bgBase: '#002b36',
      bgElevated: '#073642',
      bgSurface: '#094855',
      bgHover: '#0a5568',
      bgActive: '#0c627a',
      borderSubtle: 'rgba(147, 161, 161, 0.1)',
      borderDefault: 'rgba(147, 161, 161, 0.2)',
      borderStrong: 'rgba(147, 161, 161, 0.3)',
      textPrimary: '#fdf6e3',
      textSecondary: '#93a1a1',
      textTertiary: '#657b83',
      textMuted: '#586e75',
      accent: '#268bd2',
      accentHover: '#2aa198',
      accentSubtle: 'rgba(38, 139, 210, 0.2)',
      accentGlow: 'rgba(38, 139, 210, 0.4)',
      success: '#859900',
      successSubtle: 'rgba(133, 153, 0, 0.2)',
      info: '#2aa198',
      infoSubtle: 'rgba(42, 161, 152, 0.2)',
    },
    terminal: {
      background: '#073642',
      foreground: '#fdf6e3',
      cursor: '#268bd2',
      cursorAccent: '#073642',
      selection: 'rgba(38, 139, 210, 0.3)',
      black: '#073642',
      red: '#dc322f',
      green: '#859900',
      yellow: '#b58900',
      blue: '#268bd2',
      magenta: '#d33682',
      cyan: '#2aa198',
      white: '#eee8d5',
      brightBlack: '#586e75',
      brightRed: '#cb4b16',
      brightGreen: '#93a1a1',
      brightYellow: '#839496',
      brightBlue: '#657b83',
      brightMagenta: '#6c71c4',
      brightCyan: '#2aa198',
      brightWhite: '#fdf6e3',
    },
  },

  // Warm Earth - Amber/sepia tones that reduce blue light exposure
  // Philosophy: Eliminates harsh blue light that disrupts circadian rhythm,
  // uses warm earth tones that are naturally calming and gentle on eyes
  {
    id: 'warm-earth',
    name: 'Warm Earth',
    colors: {
      bgBase: '#1a1612',
      bgElevated: '#231e18',
      bgSurface: '#2c261e',
      bgHover: '#362e24',
      bgActive: '#40372a',
      borderSubtle: 'rgba(210, 180, 140, 0.1)',
      borderDefault: 'rgba(210, 180, 140, 0.18)',
      borderStrong: 'rgba(210, 180, 140, 0.28)',
      textPrimary: '#f5e6d3',
      textSecondary: '#c4a882',
      textTertiary: '#8b7355',
      textMuted: '#5c4d3d',
      accent: '#d4a574',
      accentHover: '#e6b888',
      accentSubtle: 'rgba(212, 165, 116, 0.18)',
      accentGlow: 'rgba(212, 165, 116, 0.4)',
      success: '#9caf6e',
      successSubtle: 'rgba(156, 175, 110, 0.18)',
      info: '#d4a574',
      infoSubtle: 'rgba(212, 165, 116, 0.18)',
    },
    terminal: {
      background: '#231e18',
      foreground: '#f5e6d3',
      cursor: '#d4a574',
      cursorAccent: '#231e18',
      selection: 'rgba(212, 165, 116, 0.3)',
      black: '#2c261e',
      red: '#c87a6a',
      green: '#9caf6e',
      yellow: '#d4a574',
      blue: '#8ba4b4',
      magenta: '#b48ea7',
      cyan: '#7dab9a',
      white: '#f5e6d3',
      brightBlack: '#6b5d4d',
      brightRed: '#d89484',
      brightGreen: '#b0c082',
      brightYellow: '#e6b888',
      brightBlue: '#a0b8c8',
      brightMagenta: '#c8a2bb',
      brightCyan: '#91bfae',
      brightWhite: '#fff8f0',
    },
  },

  // Soft Gray - Low contrast theme optimized for astigmatism
  // Philosophy: Avoids halation effect caused by bright text on dark backgrounds,
  // uses soft medium-gray backgrounds with gentle contrast for comfortable extended reading
  {
    id: 'soft-gray',
    name: 'Soft Gray',
    colors: {
      bgBase: '#2a2a2e',
      bgElevated: '#323236',
      bgSurface: '#3a3a3f',
      bgHover: '#424248',
      bgActive: '#4a4a51',
      borderSubtle: 'rgba(180, 180, 186, 0.12)',
      borderDefault: 'rgba(180, 180, 186, 0.2)',
      borderStrong: 'rgba(180, 180, 186, 0.3)',
      textPrimary: '#d5d5da',
      textSecondary: '#a8a8b0',
      textTertiary: '#7a7a84',
      textMuted: '#5c5c66',
      accent: '#7eb8da',
      accentHover: '#96c8e6',
      accentSubtle: 'rgba(126, 184, 218, 0.18)',
      accentGlow: 'rgba(126, 184, 218, 0.35)',
      success: '#8cc084',
      successSubtle: 'rgba(140, 192, 132, 0.18)',
      info: '#7eb8da',
      infoSubtle: 'rgba(126, 184, 218, 0.18)',
    },
    terminal: {
      background: '#323236',
      foreground: '#d5d5da',
      cursor: '#7eb8da',
      cursorAccent: '#323236',
      selection: 'rgba(126, 184, 218, 0.28)',
      black: '#3a3a3f',
      red: '#d09090',
      green: '#8cc084',
      yellow: '#d0b878',
      blue: '#7eb8da',
      magenta: '#b898c0',
      cyan: '#78bab4',
      white: '#d5d5da',
      brightBlack: '#6a6a74',
      brightRed: '#daa0a0',
      brightGreen: '#9cd094',
      brightYellow: '#e0c888',
      brightBlue: '#8ec8ea',
      brightMagenta: '#c8a8d0',
      brightCyan: '#88cac4',
      brightWhite: '#eaeaef',
    },
  },

  // Custom - user-defined colors, base identical to Dark theme
  {
    id: 'custom',
    name: 'Custom',
    colors: {
      bgBase: '#0d0d0f',
      bgElevated: '#141417',
      bgSurface: '#1a1a1f',
      bgHover: '#222228',
      bgActive: '#2a2a32',
      borderSubtle: 'rgba(255, 255, 255, 0.06)',
      borderDefault: 'rgba(255, 255, 255, 0.1)',
      borderStrong: 'rgba(255, 255, 255, 0.15)',
      textPrimary: '#e8e8ed',
      textSecondary: '#9898a0',
      textTertiary: '#606068',
      textMuted: '#48484f',
      accent: '#e87c45',
      accentHover: '#f08d58',
      accentSubtle: 'rgba(232, 124, 69, 0.15)',
      accentGlow: 'rgba(232, 124, 69, 0.4)',
      success: '#4ade80',
      successSubtle: 'rgba(74, 222, 128, 0.15)',
      info: '#60a5fa',
      infoSubtle: 'rgba(96, 165, 250, 0.15)',
    },
    terminal: {
      background: '#141417',
      foreground: '#e8e8ed',
      cursor: '#e87c45',
      cursorAccent: '#141417',
      selection: 'rgba(232, 124, 69, 0.3)',
      black: '#1a1a1f',
      red: '#f14c4c',
      green: '#4ade80',
      yellow: '#fbbf24',
      blue: '#60a5fa',
      magenta: '#c084fc',
      cyan: '#22d3ee',
      white: '#e8e8ed',
      brightBlack: '#606068',
      brightRed: '#f87171',
      brightGreen: '#86efac',
      brightYellow: '#fcd34d',
      brightBlue: '#93c5fd',
      brightMagenta: '#d8b4fe',
      brightCyan: '#67e8f9',
      brightWhite: '#ffffff',
    },
  },
]

export function getThemeById(id: string): Theme {
  return themes.find(t => t.id === id) || themes[0]
}

export function applyTheme(theme: Theme, customization?: ThemeCustomization | null): void {
  const root = document.documentElement
  const c = theme.colors
  const t = theme.terminal

  // Set theme ID for theme-specific CSS
  root.setAttribute('data-theme', theme.id)

  // Apply base colors
  root.style.setProperty('--bg-base', c.bgBase)
  root.style.setProperty('--bg-elevated', c.bgElevated)
  root.style.setProperty('--bg-surface', c.bgSurface)
  root.style.setProperty('--bg-hover', c.bgHover)
  root.style.setProperty('--bg-active', c.bgActive)
  root.style.setProperty('--border-subtle', c.borderSubtle)
  root.style.setProperty('--border-default', c.borderDefault)
  root.style.setProperty('--border-strong', c.borderStrong)
  root.style.setProperty('--text-primary', c.textPrimary)
  root.style.setProperty('--text-secondary', c.textSecondary)
  root.style.setProperty('--text-tertiary', c.textTertiary)
  root.style.setProperty('--text-muted', c.textMuted)
  root.style.setProperty('--accent', c.accent)
  root.style.setProperty('--accent-hover', c.accentHover)
  root.style.setProperty('--accent-subtle', c.accentSubtle)
  root.style.setProperty('--accent-glow', c.accentGlow)
  root.style.setProperty('--success', c.success)
  root.style.setProperty('--success-subtle', c.successSubtle)
  root.style.setProperty('--info', c.info)
  root.style.setProperty('--info-subtle', c.infoSubtle)

  // Apply base terminal colors (before customization)
  root.style.setProperty('--terminal-red', t.red)
  root.style.setProperty('--terminal-green', t.green)
  root.style.setProperty('--terminal-yellow', t.yellow)
  root.style.setProperty('--terminal-blue', t.blue)
  root.style.setProperty('--terminal-magenta', t.magenta)
  root.style.setProperty('--terminal-cyan', t.cyan)
  root.style.setProperty('--terminal-bright-red', t.brightRed)
  root.style.setProperty('--terminal-bright-green', t.brightGreen)
  root.style.setProperty('--terminal-bright-yellow', t.brightYellow)
  root.style.setProperty('--terminal-bright-blue', t.brightBlue)
  root.style.setProperty('--terminal-bright-magenta', t.brightMagenta)
  root.style.setProperty('--terminal-bright-cyan', t.brightCyan)

  // Apply CSS overrides only for the custom theme
  const activeCustomization = (customization && theme.id === 'custom') ? customization : null
  if (activeCustomization) {
    if (activeCustomization.backgroundColor) {
      applyBackgroundColor(activeCustomization.backgroundColor)
    }
    if (activeCustomization.textColor) {
      const bgColor = activeCustomization.backgroundColor || theme.colors.bgBase
      applyTextColor(activeCustomization.textColor, bgColor)
    }
    if (activeCustomization.accentColor) {
      applyAccentColor(activeCustomization.accentColor)
    }
    if (activeCustomization.terminalColors) {
      applyTerminalColors(activeCustomization.terminalColors, theme)
    }
  }

  // Always broadcast terminal theme update and cache for late-mounting terminals
  const terminalTheme = getTerminalThemeWithCustomization(theme, activeCustomization)
  _lastTerminalTheme = terminalTheme
  console.log('[Theme] applyTheme dispatching terminal-theme-update, bg:', terminalTheme.background, 'theme:', theme.id)
  window.dispatchEvent(new CustomEvent('terminal-theme-update', { detail: terminalTheme }))
}

// Generate accent color variants from a hex color
export function generateAccentColors(hex: string): {
  accent: string
  accentHover: string
  accentSubtle: string
  accentGlow: string
} {
  // Parse hex to RGB
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  // Lighten by ~10% for hover
  const lighten = (value: number) => Math.min(255, Math.round(value + (255 - value) * 0.15))
  const hoverR = lighten(r)
  const hoverG = lighten(g)
  const hoverB = lighten(b)

  return {
    accent: hex,
    accentHover: `#${hoverR.toString(16).padStart(2, '0')}${hoverG.toString(16).padStart(2, '0')}${hoverB.toString(16).padStart(2, '0')}`,
    accentSubtle: `rgba(${r}, ${g}, ${b}, 0.15)`,
    accentGlow: `rgba(${r}, ${g}, ${b}, 0.4)`,
  }
}

// Apply custom accent color to CSS variables
export function applyAccentColor(hex: string): void {
  const root = document.documentElement
  const colors = generateAccentColors(hex)

  root.style.setProperty('--accent', colors.accent)
  root.style.setProperty('--accent-hover', colors.accentHover)
  root.style.setProperty('--accent-subtle', colors.accentSubtle)
  root.style.setProperty('--accent-glow', colors.accentGlow)

  // Also update terminal cursor/selection colors via CSS variables
  // These are picked up by xterm when terminals refresh
  root.style.setProperty('--terminal-cursor', colors.accent)
  root.style.setProperty('--terminal-selection', `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, 0.3)`)
}

// Terminal ANSI colors customization
export interface TerminalColorsCustomization {
  black?: string
  red?: string
  green?: string
  yellow?: string
  blue?: string
  magenta?: string
  cyan?: string
  white?: string
}

// Theme customization options
export interface ThemeCustomization {
  accentColor: string | null
  backgroundColor: string | null
  textColor: string | null
  terminalColors: TerminalColorsCustomization | null
}

// Helper to parse hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

// Helper to convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
}

// Desaturate a color by a percentage (0 = full color, 100 = grayscale)
function desaturate(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex)
  const gray = 0.299 * r + 0.587 * g + 0.114 * b  // Luminance formula
  const factor = amount / 100
  const newR = r + (gray - r) * factor
  const newG = g + (gray - g) * factor
  const newB = b + (gray - b) * factor
  return rgbToHex(newR, newG, newB)
}

// Adjust brightness of a color (-100 to +100)
function adjustBrightness(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex)
  const factor = amount / 100
  let newR, newG, newB
  if (factor > 0) {
    // Lighten
    newR = r + (255 - r) * factor
    newG = g + (255 - g) * factor
    newB = b + (255 - b) * factor
  } else {
    // Darken
    newR = r * (1 + factor)
    newG = g * (1 + factor)
    newB = b * (1 + factor)
  }
  return rgbToHex(Math.max(0, Math.min(255, newR)), Math.max(0, Math.min(255, newG)), Math.max(0, Math.min(255, newB)))
}

// Determine if a color is light or dark
export function isLightColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex)
  // Use relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

// Derive background color hierarchy from a base color
export function deriveBackgroundColors(baseHex: string, isLight: boolean): {
  bgBase: string
  bgElevated: string
  bgSurface: string
  bgHover: string
  bgActive: string
  borderSubtle: string
  borderDefault: string
  borderStrong: string
} {
  const { r, g, b } = hexToRgb(baseHex)
  // For dark themes, lighten; for light themes, darken
  const direction = isLight ? -1 : 1

  return {
    bgBase: baseHex,
    bgElevated: adjustBrightness(baseHex, direction * 5),
    bgSurface: adjustBrightness(baseHex, direction * 10),
    bgHover: adjustBrightness(baseHex, direction * 15),
    bgActive: adjustBrightness(baseHex, direction * 20),
    borderSubtle: isLight ? `rgba(0, 0, 0, 0.06)` : `rgba(255, 255, 255, 0.06)`,
    borderDefault: isLight ? `rgba(0, 0, 0, 0.1)` : `rgba(255, 255, 255, 0.1)`,
    borderStrong: isLight ? `rgba(0, 0, 0, 0.15)` : `rgba(255, 255, 255, 0.15)`,
  }
}

// Derive text color hierarchy from a primary text color
export function deriveTextColors(primaryHex: string, baseBackground: string): {
  textPrimary: string
  textSecondary: string
  textTertiary: string
  textMuted: string
} {
  const isLight = isLightColor(baseBackground)
  // For light backgrounds (dark text), lighten to get secondary etc.
  // For dark backgrounds (light text), darken to get secondary etc.
  const direction = isLight ? 1 : -1

  return {
    textPrimary: primaryHex,
    textSecondary: adjustBrightness(primaryHex, direction * 35),
    textTertiary: adjustBrightness(primaryHex, direction * 55),
    textMuted: adjustBrightness(primaryHex, direction * 70),
  }
}

// Derive bright variant of a terminal color (lighten by 25%)
export function deriveBrightColor(hex: string): string {
  return adjustBrightness(hex, 25)
}

// Apply custom background color and derived colors
export function applyBackgroundColor(hex: string): void {
  const root = document.documentElement
  const isLight = isLightColor(hex)
  const colors = deriveBackgroundColors(hex, isLight)

  root.style.setProperty('--bg-base', colors.bgBase)
  root.style.setProperty('--bg-elevated', colors.bgElevated)
  root.style.setProperty('--bg-surface', colors.bgSurface)
  root.style.setProperty('--bg-hover', colors.bgHover)
  root.style.setProperty('--bg-active', colors.bgActive)
  root.style.setProperty('--border-subtle', colors.borderSubtle)
  root.style.setProperty('--border-default', colors.borderDefault)
  root.style.setProperty('--border-strong', colors.borderStrong)
}

// Apply custom text color and derived colors
export function applyTextColor(hex: string, backgroundColor: string): void {
  const root = document.documentElement
  const colors = deriveTextColors(hex, backgroundColor)

  root.style.setProperty('--text-primary', colors.textPrimary)
  root.style.setProperty('--text-secondary', colors.textSecondary)
  root.style.setProperty('--text-tertiary', colors.textTertiary)
  root.style.setProperty('--text-muted', colors.textMuted)
}

// Apply custom terminal colors (only the specified ones)
export function applyTerminalColors(colors: TerminalColorsCustomization, theme: Theme): void {
  const root = document.documentElement
  const t = theme.terminal

  // Apply each custom color and its bright variant
  if (colors.black) {
    root.style.setProperty('--terminal-black', colors.black)
  }
  if (colors.red) {
    root.style.setProperty('--terminal-red', colors.red)
    root.style.setProperty('--terminal-bright-red', deriveBrightColor(colors.red))
  }
  if (colors.green) {
    root.style.setProperty('--terminal-green', colors.green)
    root.style.setProperty('--terminal-bright-green', deriveBrightColor(colors.green))
  }
  if (colors.yellow) {
    root.style.setProperty('--terminal-yellow', colors.yellow)
    root.style.setProperty('--terminal-bright-yellow', deriveBrightColor(colors.yellow))
  }
  if (colors.blue) {
    root.style.setProperty('--terminal-blue', colors.blue)
    root.style.setProperty('--terminal-bright-blue', deriveBrightColor(colors.blue))
  }
  if (colors.magenta) {
    root.style.setProperty('--terminal-magenta', colors.magenta)
    root.style.setProperty('--terminal-bright-magenta', deriveBrightColor(colors.magenta))
  }
  if (colors.cyan) {
    root.style.setProperty('--terminal-cyan', colors.cyan)
    root.style.setProperty('--terminal-bright-cyan', deriveBrightColor(colors.cyan))
  }
  if (colors.white) {
    root.style.setProperty('--terminal-white', colors.white)
    root.style.setProperty('--terminal-bright-white', deriveBrightColor(colors.white))
  }
}

// Cache the last-applied terminal theme so terminals that mount after applyTheme can use it
let _lastTerminalTheme: Record<string, string> | null = null

/** Returns the most recently applied terminal theme (for terminals that mount after the event) */
export function getLastTerminalTheme(): Record<string, string> | null {
  return _lastTerminalTheme
}

// Generate xterm-compatible theme object with customizations applied
export function getTerminalThemeWithCustomization(theme: Theme, customization: ThemeCustomization | null): {
  background: string
  foreground: string
  cursor: string
  cursorAccent: string
  selectionBackground: string
  black: string
  red: string
  green: string
  yellow: string
  blue: string
  magenta: string
  cyan: string
  white: string
  brightBlack: string
  brightRed: string
  brightGreen: string
  brightYellow: string
  brightBlue: string
  brightMagenta: string
  brightCyan: string
  brightWhite: string
} {
  const t = theme.terminal
  const tc = customization?.terminalColors

  // Get background (from customization or theme)
  let background = t.background
  if (customization?.backgroundColor) {
    const isLight = isLightColor(customization.backgroundColor)
    const derived = deriveBackgroundColors(customization.backgroundColor, isLight)
    background = derived.bgElevated
  }

  // Get foreground (from customization or theme)
  const foreground = customization?.textColor || t.foreground

  // Get cursor color (accent or theme default)
  const cursorColor = customization?.accentColor || t.cursor
  const selectionColor = customization?.accentColor
    ? `rgba(${parseInt(customization.accentColor.slice(1, 3), 16)}, ${parseInt(customization.accentColor.slice(3, 5), 16)}, ${parseInt(customization.accentColor.slice(5, 7), 16)}, 0.3)`
    : t.selection

  // Get terminal colors (custom or theme defaults)
  const red = tc?.red || t.red
  const green = tc?.green || t.green
  const yellow = tc?.yellow || t.yellow
  const blue = tc?.blue || t.blue
  const magenta = tc?.magenta || t.magenta
  const cyan = tc?.cyan || t.cyan
  const white = tc?.white || t.white
  const black = tc?.black || t.black

  return {
    background,
    foreground,
    cursor: cursorColor,
    cursorAccent: background,
    selectionBackground: selectionColor,
    black,
    red,
    green,
    yellow,
    blue,
    magenta,
    cyan,
    white,
    brightBlack: t.brightBlack,
    brightRed: tc?.red ? deriveBrightColor(tc.red) : t.brightRed,
    brightGreen: tc?.green ? deriveBrightColor(tc.green) : t.brightGreen,
    brightYellow: tc?.yellow ? deriveBrightColor(tc.yellow) : t.brightYellow,
    brightBlue: tc?.blue ? deriveBrightColor(tc.blue) : t.brightBlue,
    brightMagenta: tc?.magenta ? deriveBrightColor(tc.magenta) : t.brightMagenta,
    brightCyan: tc?.cyan ? deriveBrightColor(tc.cyan) : t.brightCyan,
    brightWhite: tc?.white ? deriveBrightColor(tc.white) : t.brightWhite,
  }
}
