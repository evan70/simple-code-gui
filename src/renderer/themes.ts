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
    name: 'Claude Orange',
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
      background: '#0d0d0f',
      foreground: '#e8e8ed',
      cursor: '#e87c45',
      cursorAccent: '#0d0d0f',
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
    id: 'midnight',
    name: 'Midnight Purple',
    colors: {
      bgBase: '#0f0a1a',
      bgElevated: '#150f24',
      bgSurface: '#1c1530',
      bgHover: '#251d3d',
      bgActive: '#2e254a',
      borderSubtle: 'rgba(139, 92, 246, 0.1)',
      borderDefault: 'rgba(139, 92, 246, 0.2)',
      borderStrong: 'rgba(139, 92, 246, 0.3)',
      textPrimary: '#e8e4f0',
      textSecondary: '#a8a0b8',
      textTertiary: '#6b6280',
      textMuted: '#4a4458',
      accent: '#a78bfa',
      accentHover: '#c4b5fd',
      accentSubtle: 'rgba(167, 139, 250, 0.15)',
      accentGlow: 'rgba(167, 139, 250, 0.4)',
      success: '#34d399',
      successSubtle: 'rgba(52, 211, 153, 0.15)',
      info: '#818cf8',
      infoSubtle: 'rgba(129, 140, 248, 0.15)',
    },
    terminal: {
      background: '#0f0a1a',
      foreground: '#e8e4f0',
      cursor: '#a78bfa',
      cursorAccent: '#0f0a1a',
      selection: 'rgba(167, 139, 250, 0.3)',
      black: '#1c1530',
      red: '#f87171',
      green: '#34d399',
      yellow: '#fbbf24',
      blue: '#818cf8',
      magenta: '#e879f9',
      cyan: '#22d3ee',
      white: '#e8e4f0',
      brightBlack: '#6b6280',
      brightRed: '#fca5a5',
      brightGreen: '#6ee7b7',
      brightYellow: '#fcd34d',
      brightBlue: '#a5b4fc',
      brightMagenta: '#f0abfc',
      brightCyan: '#67e8f9',
      brightWhite: '#ffffff',
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    colors: {
      bgBase: '#0a100e',
      bgElevated: '#0f1814',
      bgSurface: '#14201a',
      bgHover: '#1a2922',
      bgActive: '#20322a',
      borderSubtle: 'rgba(74, 222, 128, 0.08)',
      borderDefault: 'rgba(74, 222, 128, 0.15)',
      borderStrong: 'rgba(74, 222, 128, 0.25)',
      textPrimary: '#e4ebe8',
      textSecondary: '#9aada3',
      textTertiary: '#5e756a',
      textMuted: '#3d4f46',
      accent: '#4ade80',
      accentHover: '#6ee7a0',
      accentSubtle: 'rgba(74, 222, 128, 0.15)',
      accentGlow: 'rgba(74, 222, 128, 0.4)',
      success: '#4ade80',
      successSubtle: 'rgba(74, 222, 128, 0.15)',
      info: '#38bdf8',
      infoSubtle: 'rgba(56, 189, 248, 0.15)',
    },
    terminal: {
      background: '#0a100e',
      foreground: '#e4ebe8',
      cursor: '#4ade80',
      cursorAccent: '#0a100e',
      selection: 'rgba(74, 222, 128, 0.3)',
      black: '#14201a',
      red: '#f87171',
      green: '#4ade80',
      yellow: '#facc15',
      blue: '#38bdf8',
      magenta: '#c084fc',
      cyan: '#2dd4bf',
      white: '#e4ebe8',
      brightBlack: '#5e756a',
      brightRed: '#fca5a5',
      brightGreen: '#86efac',
      brightYellow: '#fde047',
      brightBlue: '#7dd3fc',
      brightMagenta: '#d8b4fe',
      brightCyan: '#5eead4',
      brightWhite: '#ffffff',
    },
  },
  {
    id: 'crimson',
    name: 'Crimson Dark',
    colors: {
      bgBase: '#100808',
      bgElevated: '#180c0c',
      bgSurface: '#201010',
      bgHover: '#2a1515',
      bgActive: '#341a1a',
      borderSubtle: 'rgba(239, 68, 68, 0.1)',
      borderDefault: 'rgba(239, 68, 68, 0.2)',
      borderStrong: 'rgba(239, 68, 68, 0.3)',
      textPrimary: '#f0e8e8',
      textSecondary: '#b8a0a0',
      textTertiary: '#806060',
      textMuted: '#584040',
      accent: '#ef4444',
      accentHover: '#f87171',
      accentSubtle: 'rgba(239, 68, 68, 0.15)',
      accentGlow: 'rgba(239, 68, 68, 0.4)',
      success: '#4ade80',
      successSubtle: 'rgba(74, 222, 128, 0.15)',
      info: '#fb923c',
      infoSubtle: 'rgba(251, 146, 60, 0.15)',
    },
    terminal: {
      background: '#100808',
      foreground: '#f0e8e8',
      cursor: '#ef4444',
      cursorAccent: '#100808',
      selection: 'rgba(239, 68, 68, 0.3)',
      black: '#201010',
      red: '#ef4444',
      green: '#4ade80',
      yellow: '#fbbf24',
      blue: '#60a5fa',
      magenta: '#f472b6',
      cyan: '#22d3ee',
      white: '#f0e8e8',
      brightBlack: '#806060',
      brightRed: '#f87171',
      brightGreen: '#86efac',
      brightYellow: '#fcd34d',
      brightBlue: '#93c5fd',
      brightMagenta: '#f9a8d4',
      brightCyan: '#67e8f9',
      brightWhite: '#ffffff',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Depths',
    colors: {
      bgBase: '#080d10',
      bgElevated: '#0c1418',
      bgSurface: '#101b20',
      bgHover: '#152228',
      bgActive: '#1a2a32',
      borderSubtle: 'rgba(34, 211, 238, 0.08)',
      borderDefault: 'rgba(34, 211, 238, 0.15)',
      borderStrong: 'rgba(34, 211, 238, 0.25)',
      textPrimary: '#e4eef0',
      textSecondary: '#8fb8c4',
      textTertiary: '#5a8090',
      textMuted: '#3a5560',
      accent: '#22d3ee',
      accentHover: '#67e8f9',
      accentSubtle: 'rgba(34, 211, 238, 0.15)',
      accentGlow: 'rgba(34, 211, 238, 0.4)',
      success: '#4ade80',
      successSubtle: 'rgba(74, 222, 128, 0.15)',
      info: '#38bdf8',
      infoSubtle: 'rgba(56, 189, 248, 0.15)',
    },
    terminal: {
      background: '#080d10',
      foreground: '#e4eef0',
      cursor: '#22d3ee',
      cursorAccent: '#080d10',
      selection: 'rgba(34, 211, 238, 0.3)',
      black: '#101b20',
      red: '#f87171',
      green: '#4ade80',
      yellow: '#fbbf24',
      blue: '#38bdf8',
      magenta: '#c084fc',
      cyan: '#22d3ee',
      white: '#e4eef0',
      brightBlack: '#5a8090',
      brightRed: '#fca5a5',
      brightGreen: '#86efac',
      brightYellow: '#fcd34d',
      brightBlue: '#7dd3fc',
      brightMagenta: '#d8b4fe',
      brightCyan: '#67e8f9',
      brightWhite: '#ffffff',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender Mist',
    colors: {
      bgBase: '#f5f0fa',
      bgElevated: '#ebe4f5',
      bgSurface: '#e0d8ed',
      bgHover: '#d5cce5',
      bgActive: '#c9bfdc',
      borderSubtle: 'rgba(139, 92, 246, 0.15)',
      borderDefault: 'rgba(139, 92, 246, 0.25)',
      borderStrong: 'rgba(139, 92, 246, 0.35)',
      textPrimary: '#2d2640',
      textSecondary: '#524868',
      textTertiary: '#7a6e90',
      textMuted: '#a093b8',
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
      accentSubtle: 'rgba(139, 92, 246, 0.15)',
      accentGlow: 'rgba(139, 92, 246, 0.3)',
      success: '#10b981',
      successSubtle: 'rgba(16, 185, 129, 0.15)',
      info: '#6366f1',
      infoSubtle: 'rgba(99, 102, 241, 0.15)',
    },
    terminal: {
      background: '#f5f0fa',
      foreground: '#2d2640',
      cursor: '#8b5cf6',
      cursorAccent: '#f5f0fa',
      selection: 'rgba(139, 92, 246, 0.25)',
      black: '#2d2640',
      red: '#dc2626',
      green: '#16a34a',
      yellow: '#ca8a04',
      blue: '#2563eb',
      magenta: '#9333ea',
      cyan: '#0891b2',
      white: '#e0d8ed',
      brightBlack: '#524868',
      brightRed: '#ef4444',
      brightGreen: '#22c55e',
      brightYellow: '#eab308',
      brightBlue: '#3b82f6',
      brightMagenta: '#a855f7',
      brightCyan: '#06b6d4',
      brightWhite: '#f5f0fa',
    },
  },
  {
    id: 'light',
    name: 'Clean Light',
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
      background: '#ffffff',
      foreground: '#1a1a1a',
      cursor: '#1a73e8',
      cursorAccent: '#ffffff',
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
      background: '#0d0a12',
      foreground: '#fff0f5',
      cursor: '#ff1493',
      cursorAccent: '#0d0a12',
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
  {
    id: 'mono',
    name: 'Monochrome',
    colors: {
      bgBase: '#0a0a0a',
      bgElevated: '#141414',
      bgSurface: '#1e1e1e',
      bgHover: '#282828',
      bgActive: '#323232',
      borderSubtle: 'rgba(255, 255, 255, 0.08)',
      borderDefault: 'rgba(255, 255, 255, 0.15)',
      borderStrong: 'rgba(255, 255, 255, 0.25)',
      textPrimary: '#e5e5e5',
      textSecondary: '#a3a3a3',
      textTertiary: '#737373',
      textMuted: '#525252',
      accent: '#ffffff',
      accentHover: '#e5e5e5',
      accentSubtle: 'rgba(255, 255, 255, 0.1)',
      accentGlow: 'rgba(255, 255, 255, 0.2)',
      success: '#a3a3a3',
      successSubtle: 'rgba(163, 163, 163, 0.15)',
      info: '#a3a3a3',
      infoSubtle: 'rgba(163, 163, 163, 0.15)',
    },
    terminal: {
      background: '#0a0a0a',
      foreground: '#e5e5e5',
      cursor: '#ffffff',
      cursorAccent: '#0a0a0a',
      selection: 'rgba(255, 255, 255, 0.2)',
      black: '#1e1e1e',
      red: '#d4d4d4',
      green: '#b3b3b3',
      yellow: '#c9c9c9',
      blue: '#a3a3a3',
      magenta: '#b8b8b8',
      cyan: '#adadad',
      white: '#e5e5e5',
      brightBlack: '#737373',
      brightRed: '#e5e5e5',
      brightGreen: '#d4d4d4',
      brightYellow: '#e0e0e0',
      brightBlue: '#c4c4c4',
      brightMagenta: '#d9d9d9',
      brightCyan: '#cecece',
      brightWhite: '#ffffff',
    },
  },
]

export function getThemeById(id: string): Theme {
  return themes.find(t => t.id === id) || themes[0]
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  const c = theme.colors

  // Set theme ID for theme-specific CSS
  root.setAttribute('data-theme', theme.id)

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
}
