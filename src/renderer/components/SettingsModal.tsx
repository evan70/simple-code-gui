import React, { useState, useEffect, useRef } from 'react'
import { themes, getThemeById, applyTheme, Theme } from '../themes'
import { VoiceBrowserModal } from './VoiceBrowserModal'
import { useVoice, WhisperModelSize } from '../contexts/VoiceContext'
import { getSampleUrl } from '../utils/voiceUtils'
import { useFocusTrap } from '../hooks/useFocusTrap'

// Whisper models available
const WHISPER_MODELS: Array<{ value: WhisperModelSize; label: string; desc: string }> = [
  { value: 'tiny.en', label: 'Tiny (75MB)', desc: 'Fastest, basic accuracy' },
  { value: 'base.en', label: 'Base (147MB)', desc: 'Good balance' },
  { value: 'small.en', label: 'Small (488MB)', desc: 'Better accuracy' },
  { value: 'medium.en', label: 'Medium (1.5GB)', desc: 'High accuracy' },
  { value: 'large-v3', label: 'Large (3GB)', desc: 'Best accuracy, multilingual' },
]

// Piper voices available
const PIPER_VOICES = [
  { value: 'en_US-libritts_r-medium', label: 'LibriTTS-R (US)', desc: 'Natural US English' },
  { value: 'en_GB-jenny_dioco-medium', label: 'Jenny (UK)', desc: 'British English' },
  { value: 'en_US-ryan-medium', label: 'Ryan (US)', desc: 'US English male' },
]

// Common tool patterns for quick selection
const COMMON_TOOLS = [
  { label: 'Read files', value: 'Read' },
  { label: 'Write files', value: 'Write' },
  { label: 'Edit files', value: 'Edit' },
  { label: 'MultiEdit', value: 'MultiEdit' },
  { label: 'Grep search', value: 'Grep' },
  { label: 'Glob search', value: 'Glob' },
  { label: 'List dirs', value: 'LS' },
  { label: 'Web fetch', value: 'WebFetch' },
  { label: 'Web search', value: 'WebSearch' },
  { label: 'Questions', value: 'AskUserQuestion' },
  { label: 'Task agents', value: 'Task' },
  { label: 'Todo list', value: 'TodoWrite' },
  { label: 'Git commands', value: 'Bash(git:*)' },
  { label: 'npm commands', value: 'Bash(npm:*)' },
  { label: 'All Bash', value: 'Bash' },
]

// Permission modes available in Claude Code
const PERMISSION_MODES = [
  { label: 'Default', value: 'default', desc: 'Ask for all permissions' },
  { label: 'Accept Edits', value: 'acceptEdits', desc: 'Auto-accept file edits' },
  { label: "Don't Ask", value: 'dontAsk', desc: 'Skip permission prompts' },
  { label: 'Bypass All', value: 'bypassPermissions', desc: 'Skip all permission checks' },
]

const BACKEND_MODES = [
  { label: 'Claude', value: 'claude', desc: 'Use Claude for code generation' },
  { label: 'Gemini', value: 'gemini', desc: 'Use Gemini for code generation' },
  { label: 'Codex', value: 'codex', desc: 'Use Codex for code generation' },
  { label: 'OpenCode', value: 'opencode', desc: 'Use OpenCode for code generation' },
  { label: 'Aider', value: 'aider', desc: 'Use Aider AI pair programmer' },
]

// Grouped state interfaces to reduce useState calls
interface GeneralSettings {
  defaultProjectDir: string
  selectedTheme: string
  autoAcceptTools: string[]
  permissionMode: string
  customTool: string
  backend: string
}

interface VoiceSettings {
  whisperStatus: { installed: boolean; models: string[]; currentModel: string | null }
  ttsStatus: { installed: boolean; voices: string[]; currentVoice: string | null }
  selectedVoice: string
  selectedEngine: 'piper' | 'xtts'
  ttsSpeed: number
  installedVoices: Array<{ key: string; displayName: string; source: string }>
}

interface XttsSettings {
  temperature: number
  topK: number
  topP: number
  repetitionPenalty: number
}

interface UIState {
  installingModel: string | null
  installingVoice: string | null
  showVoiceBrowser: boolean
  playingPreview: string | null
  previewLoading: string | null
  removingTTS: boolean
  ttsRemovalResult: { success: number; failed: number } | null
}

// Default values for grouped state
const DEFAULT_GENERAL: GeneralSettings = {
  defaultProjectDir: '',
  selectedTheme: 'default',
  autoAcceptTools: [],
  permissionMode: 'default',
  customTool: '',
  backend: 'claude'
}

const DEFAULT_VOICE: VoiceSettings = {
  whisperStatus: { installed: false, models: [], currentModel: null },
  ttsStatus: { installed: false, voices: [], currentVoice: null },
  selectedVoice: 'en_US-libritts_r-medium',
  selectedEngine: 'piper',
  ttsSpeed: 1.0,
  installedVoices: []
}

const DEFAULT_XTTS: XttsSettings = {
  temperature: 0.65,
  topK: 50,
  topP: 0.85,
  repetitionPenalty: 2.0
}

const DEFAULT_UI: UIState = {
  installingModel: null,
  installingVoice: null,
  showVoiceBrowser: false,
  playingPreview: null,
  previewLoading: null,
  removingTTS: false,
  ttsRemovalResult: null
}

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onThemeChange: (theme: Theme) => void
  onSaved?: (settings: { defaultProjectDir: string; theme: string; autoAcceptTools?: string[]; permissionMode?: string; backend?: string }) => void
}

export function SettingsModal({ isOpen, onClose, onThemeChange, onSaved }: SettingsModalProps) {
  // Grouped state: general settings (theme, directory, permissions, backend)
  const [general, setGeneral] = useState<GeneralSettings>(DEFAULT_GENERAL)

  // Focus trap for modal accessibility
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen)

  // Voice context for active whisper model and volume
  const { whisperModel: activeWhisperModel, setWhisperModel: setActiveWhisperModel, volume: voiceVolume } = useVoice()

  // Extensions state
  const [installedExtensions, setInstalledExtensions] = useState<Array<{ id: string; name: string; type: string }>>([])

  // Grouped state: voice settings (TTS, whisper status, selected voice/engine)
  const [voice, setVoice] = useState<VoiceSettings>(DEFAULT_VOICE)

  // Grouped state: XTTS quality settings
  const [xtts, setXtts] = useState<XttsSettings>(DEFAULT_XTTS)

  // Grouped state: UI/loading states
  const [ui, setUI] = useState<UIState>(DEFAULT_UI)

  // Audio preview ref
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)

  // Load installed voices (Piper and XTTS)
  const refreshInstalledVoices = async () => {
    try {
      const [piperVoices, xttsVoices] = await Promise.all([
        window.electronAPI.voiceGetInstalled?.(),
        window.electronAPI.xttsGetVoices?.()
      ])
      const combined: Array<{ key: string; displayName: string; source: string }> = []
      if (piperVoices) combined.push(...piperVoices)
      if (xttsVoices) {
        combined.push(...xttsVoices.map((v: { id: string; name: string }) => ({
          key: v.id,
          displayName: v.name,
          source: 'xtts'
        })))
      }
      setVoice(prev => ({ ...prev, installedVoices: combined }))
    } catch (e) {
      console.error('Failed to refresh installed voices:', e)
      setVoice(prev => ({ ...prev, installedVoices: [] }))
    }
  }

  useEffect(() => {
    if (isOpen) {
      window.electronAPI.getSettings().then((settings) => {
        setGeneral(prev => ({
          ...prev,
          defaultProjectDir: settings.defaultProjectDir || '',
          selectedTheme: settings.theme || 'default',
          autoAcceptTools: settings.autoAcceptTools || [],
          permissionMode: settings.permissionMode || 'default',
          backend: settings.backend || 'claude'
        }))
      })

      // Load voice settings (active voice)
      window.electronAPI.voiceGetSettings?.().then((voiceSettings: { ttsVoice?: string; ttsEngine?: string; ttsSpeed?: number; xttsTemperature?: number; xttsTopK?: number; xttsTopP?: number; xttsRepetitionPenalty?: number }) => {
        if (voiceSettings) {
          setVoice(prev => ({
            ...prev,
            selectedVoice: voiceSettings.ttsVoice || 'en_US-libritts_r-medium',
            selectedEngine: (voiceSettings.ttsEngine as 'piper' | 'xtts') || 'piper',
            ttsSpeed: voiceSettings.ttsSpeed || 1.0
          }))
          setXtts({
            temperature: voiceSettings.xttsTemperature ?? 0.65,
            topK: voiceSettings.xttsTopK ?? 50,
            topP: voiceSettings.xttsTopP ?? 0.85,
            repetitionPenalty: voiceSettings.xttsRepetitionPenalty ?? 2.0
          })
        }
      }).catch(e => console.error('Failed to load voice settings:', e))

      // Load voice status
      window.electronAPI.voiceCheckWhisper?.().then(status => {
        setVoice(prev => ({ ...prev, whisperStatus: status }))
      }).catch(e => console.error('Failed to check Whisper status:', e))

      window.electronAPI.voiceCheckTTS?.().then(status => {
        setVoice(prev => ({ ...prev, ttsStatus: status }))
      }).catch(e => console.error('Failed to check TTS status:', e))

      refreshInstalledVoices()

      // Load installed extensions
      window.electronAPI.extensionsGetInstalled?.().then(exts => {
        setInstalledExtensions(exts || [])
      }).catch(e => console.error('Failed to load installed extensions:', e))
    } else {
      // Stop preview when modal closes
      if (previewAudioRef.current) {
        previewAudioRef.current.pause()
        previewAudioRef.current.src = ''
        previewAudioRef.current = null
      }
      setUI(prev => ({ ...prev, playingPreview: null, previewLoading: null }))
    }
  }, [isOpen])

  const handleSelectDirectory = async () => {
    const dir = await window.electronAPI.selectDirectory()
    if (dir) {
      setGeneral(prev => ({ ...prev, defaultProjectDir: dir }))
    }
  }

  const handleThemeSelect = (themeId: string) => {
    setGeneral(prev => ({ ...prev, selectedTheme: themeId }))
    const theme = getThemeById(themeId)
    applyTheme(theme)
    onThemeChange(theme)
  }

  const handleSave = async () => {
    const newSettings = {
      defaultProjectDir: general.defaultProjectDir,
      theme: general.selectedTheme,
      autoAcceptTools: general.autoAcceptTools,
      permissionMode: general.permissionMode,
      backend: general.backend
    }
    await window.electronAPI.saveSettings(newSettings)
    // Save voice settings including XTTS quality settings
    await window.electronAPI.voiceApplySettings?.({
      ttsVoice: voice.selectedVoice,
      ttsEngine: voice.selectedEngine,
      ttsSpeed: voice.ttsSpeed,
      xttsTemperature: xtts.temperature,
      xttsTopK: xtts.topK,
      xttsTopP: xtts.topP,
      xttsRepetitionPenalty: xtts.repetitionPenalty
    })
    onSaved?.(newSettings)
    onClose()
  }

  const handleVoiceSelect = (voiceKey: string, source: string) => {
    setVoice(prev => ({
      ...prev,
      selectedVoice: voiceKey,
      selectedEngine: source === 'xtts' ? 'xtts' : 'piper'
    }))
  }

  const toggleTool = (tool: string) => {
    setGeneral(prev => ({
      ...prev,
      autoAcceptTools: prev.autoAcceptTools.includes(tool)
        ? prev.autoAcceptTools.filter(t => t !== tool)
        : [...prev.autoAcceptTools, tool]
    }))
  }

  const addCustomTool = () => {
    const trimmed = general.customTool.trim()
    if (trimmed && !general.autoAcceptTools.includes(trimmed)) {
      setGeneral(prev => ({
        ...prev,
        autoAcceptTools: [...prev.autoAcceptTools, trimmed],
        customTool: ''
      }))
    }
  }

  const removeCustomTool = (tool: string) => {
    setGeneral(prev => ({
      ...prev,
      autoAcceptTools: prev.autoAcceptTools.filter(t => t !== tool)
    }))
  }

  const handleInstallWhisperModel = async (model: string) => {
    setUI(prev => ({ ...prev, installingModel: model }))
    try {
      await window.electronAPI.voiceInstallWhisper?.(model)
      const status = await window.electronAPI.voiceCheckWhisper?.()
      if (status) setVoice(prev => ({ ...prev, whisperStatus: status }))
    } catch (e) {
      console.error('Failed to install Whisper model:', e)
    }
    setUI(prev => ({ ...prev, installingModel: null }))
  }

  const handleInstallVoice = async (voiceToInstall: string) => {
    setUI(prev => ({ ...prev, installingVoice: voiceToInstall }))
    try {
      // Install Piper if not installed
      if (!voice.ttsStatus.installed) {
        await window.electronAPI.voiceInstallPiper?.()
      }
      await window.electronAPI.voiceInstallVoice?.(voiceToInstall)
      const status = await window.electronAPI.voiceCheckTTS?.()
      if (status) setVoice(prev => ({ ...prev, ttsStatus: status }))
    } catch (e) {
      console.error('Failed to install voice:', e)
    }
    setUI(prev => ({ ...prev, installingVoice: null }))
  }

  // Stop any playing preview
  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
      previewAudioRef.current.src = ''
      previewAudioRef.current = null
    }
    setUI(prev => ({ ...prev, playingPreview: null, previewLoading: null }))
  }

  // Preview a voice
  const handlePreview = async (voiceKey: string, source: string) => {
    // Stop current preview if playing
    stopPreview()

    // If clicking the same voice, just stop
    if (ui.playingPreview === voiceKey) {
      return
    }

    // For XTTS voices, synthesize sample text
    if (source === 'xtts') {
      setUI(prev => ({ ...prev, previewLoading: voiceKey }))
      try {
        const result = await window.electronAPI.xttsSpeak?.(
          'Hello! This is a preview of my voice.',
          voiceKey,
          'en'
        )
        if (result?.success && result.audioData) {
          const audio = new Audio(`data:audio/wav;base64,${result.audioData}`)
          audio.volume = voiceVolume
          audio.onended = () => {
            setUI(prev => ({ ...prev, playingPreview: null }))
            previewAudioRef.current = null
          }
          audio.onerror = () => {
            setUI(prev => ({ ...prev, playingPreview: null }))
            previewAudioRef.current = null
          }
          previewAudioRef.current = audio
          setUI(prev => ({ ...prev, previewLoading: null, playingPreview: voiceKey }))
          audio.play()
        } else {
          setUI(prev => ({ ...prev, previewLoading: null }))
          console.error('Failed to preview XTTS voice:', result?.error)
        }
      } catch (e) {
        setUI(prev => ({ ...prev, previewLoading: null }))
        console.error('Failed to preview XTTS voice:', e)
      }
      return
    }

    // For Piper voices, try Hugging Face sample first
    const sampleUrl = getSampleUrl(voiceKey)
    if (sampleUrl) {
      const audio = new Audio(sampleUrl)
      audio.volume = voiceVolume
      audio.onended = () => {
        setUI(prev => ({ ...prev, playingPreview: null }))
        previewAudioRef.current = null
      }
      audio.onerror = () => {
        setUI(prev => ({ ...prev, playingPreview: null }))
        previewAudioRef.current = null
      }
      previewAudioRef.current = audio
      setUI(prev => ({ ...prev, playingPreview: voiceKey }))
      audio.play()
      return
    }

    // For built-in/custom Piper voices, synthesize sample text
    setUI(prev => ({ ...prev, previewLoading: voiceKey }))
    try {
      // Temporarily set the voice, speak, then restore
      const originalVoice = voice.selectedVoice
      const originalEngine = voice.selectedEngine
      await window.electronAPI.voiceApplySettings?.({
        ttsVoice: voiceKey,
        ttsEngine: 'piper',
        ttsSpeed: 1.0
      })
      const result = await window.electronAPI.voiceSpeak?.(
        'Hello! This is a preview of my voice.'
      )
      // Restore original settings
      await window.electronAPI.voiceApplySettings?.({
        ttsVoice: originalVoice,
        ttsEngine: originalEngine,
        ttsSpeed: voice.ttsSpeed
      })

      if (result?.success && result.audioData) {
        const audio = new Audio(`data:audio/wav;base64,${result.audioData}`)
        audio.volume = voiceVolume
        audio.onended = () => {
          setUI(prev => ({ ...prev, playingPreview: null }))
          previewAudioRef.current = null
        }
        audio.onerror = () => {
          setUI(prev => ({ ...prev, playingPreview: null }))
          previewAudioRef.current = null
        }
        previewAudioRef.current = audio
        setUI(prev => ({ ...prev, previewLoading: null, playingPreview: voiceKey }))
        audio.play()
      } else {
        setUI(prev => ({ ...prev, previewLoading: null }))
        console.error('Failed to preview voice:', result?.error)
      }
    } catch (e) {
      setUI(prev => ({ ...prev, previewLoading: null }))
      console.error('Failed to preview voice:', e)
    }
  }

  // Remove TTS instructions from all projects (uninstall feature)
  const handleRemoveTTSFromAllProjects = async () => {
    if (!confirm('This will remove TTS voice output instructions from CLAUDE.md files in ALL your projects. This is useful if you want to stop using Claude Terminal.\n\nContinue?')) {
      return
    }

    setUI(prev => ({ ...prev, removingTTS: true, ttsRemovalResult: null }))

    try {
      const workspace = await window.electronAPI.getWorkspace()
      const projects = workspace?.projects || []

      let success = 0
      let failed = 0

      for (const project of projects) {
        try {
          const result = await window.electronAPI.ttsRemoveInstructions?.(project.path)
          if (result?.success) {
            success++
          } else {
            failed++
          }
        } catch {
          failed++
        }
      }

      setUI(prev => ({ ...prev, ttsRemovalResult: { success, failed } }))
    } catch (e) {
      console.error('Failed to remove TTS instructions:', e)
      setUI(prev => ({ ...prev, ttsRemovalResult: { success: 0, failed: 1 } }))
    }

    setUI(prev => ({ ...prev, removingTTS: false }))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal settings-modal" ref={focusTrapRef} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <div className="form-group">
            <label>Theme</label>
            <div className="theme-grid">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  className={`theme-swatch ${general.selectedTheme === theme.id ? 'selected' : ''}`}
                  onClick={() => handleThemeSelect(theme.id)}
                  title={theme.name}
                >
                  <div
                    className="theme-preview"
                    style={{
                      background: theme.colors.bgBase,
                      borderColor: theme.colors.accent,
                    }}
                  >
                    <div
                      className="theme-accent"
                      style={{ background: theme.colors.accent }}
                    />
                    <div
                      className="theme-text"
                      style={{ background: theme.colors.textPrimary }}
                    />
                    <div
                      className="theme-text-sm"
                      style={{ background: theme.colors.textSecondary }}
                    />
                  </div>
                  <span className="theme-name">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Default Project Directory</label>
            <div className="input-with-button">
              <input
                type="text"
                value={general.defaultProjectDir}
                onChange={(e) => setGeneral(prev => ({ ...prev, defaultProjectDir: e.target.value }))}
                placeholder="Select a directory..."
                readOnly
              />
              <button className="browse-btn" onClick={handleSelectDirectory}>
                Browse
              </button>
            </div>
            <p className="form-hint">
              New projects created with "Make Project" will be placed here.
            </p>
          </div>

          <div className="form-group">
            <label>Global Permissions</label>
            <p className="form-hint">
              Default permissions for all projects. Can be overridden per-project.
            </p>
            <div className="tool-chips">
              {COMMON_TOOLS.map((tool) => (
                <button
                  key={tool.value}
                  className={`tool-chip ${general.autoAcceptTools.includes(tool.value) ? 'selected' : ''}`}
                  onClick={() => toggleTool(tool.value)}
                  title={tool.value}
                >
                  {tool.label}
                </button>
              ))}
            </div>
            <div className="custom-tool-input">
              <input
                type="text"
                value={general.customTool}
                onChange={(e) => setGeneral(prev => ({ ...prev, customTool: e.target.value }))}
                placeholder="Custom pattern (e.g., Bash(python:*))"
                onKeyDown={(e) => e.key === 'Enter' && addCustomTool()}
              />
              <button className="browse-btn" onClick={addCustomTool}>
                Add
              </button>
            </div>
            {general.autoAcceptTools.filter(t => !COMMON_TOOLS.some(ct => ct.value === t)).length > 0 && (
              <div className="custom-tools-list">
                {general.autoAcceptTools.filter(t => !COMMON_TOOLS.some(ct => ct.value === t)).map((tool) => (
                  <span key={tool} className="custom-tool-tag">
                    {tool}
                    <button onClick={() => removeCustomTool(tool)}>x</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Permission Mode</label>
            <p className="form-hint">
              Global permission behavior for Claude Code sessions.
            </p>
            <div className="permission-mode-options">
              {PERMISSION_MODES.map((mode) => (
                <label key={mode.value} className={`permission-mode-option ${general.permissionMode === mode.value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="permissionMode"
                    value={mode.value}
                    checked={general.permissionMode === mode.value}
                    onChange={(e) => setGeneral(prev => ({ ...prev, permissionMode: e.target.value }))}
                  />
                  <span className="mode-label">{mode.label}</span>
                  <span className="mode-desc">{mode.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Backend</label>
            <p className="form-hint">
              The backend to use for the terminal sessions.
            </p>
            <div className="permission-mode-options">
              {BACKEND_MODES.map((mode) => (
                <label key={mode.value} className={`permission-mode-option ${general.backend === mode.value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="backend"
                    value={mode.value}
                    checked={general.backend === mode.value}
                    onChange={(e) => setGeneral(prev => ({ ...prev, backend: e.target.value }))}
                  />
                  <span className="mode-label">{mode.label}</span>
                  <span className="mode-desc">{mode.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Extensions</label>
            <p className="form-hint">
              Skills, MCPs, and Agents extend Claude Code's capabilities.
            </p>
            <div className="extensions-summary">
              {installedExtensions.length > 0 ? (
                <div className="extension-counts">
                  <span className="ext-count">
                    <strong>{installedExtensions.filter(e => e.type === 'skill').length}</strong> Skills
                  </span>
                  <span className="ext-count">
                    <strong>{installedExtensions.filter(e => e.type === 'mcp').length}</strong> MCPs
                  </span>
                  <span className="ext-count">
                    <strong>{installedExtensions.filter(e => e.type === 'agent').length}</strong> Agents
                  </span>
                </div>
              ) : (
                <p className="no-extensions">No extensions installed yet.</p>
              )}
              <p className="form-hint" style={{ marginTop: '8px', fontSize: '12px' }}>
                Right-click a project in the sidebar and select "Extensions..." to manage extensions for that project.
              </p>
            </div>
          </div>

          <div className="form-group">
            <label>Voice Input (Speech-to-Text)</label>
            <p className="form-hint">
              Whisper models for transcribing your voice. Larger = more accurate but slower.
            </p>
            <div className="voice-options">
              {WHISPER_MODELS.map((model) => {
                const isInstalled = voice.whisperStatus.models.includes(model.value)
                const isInstalling = ui.installingModel === model.value
                const isActive = activeWhisperModel === model.value
                return (
                  <div
                    key={model.value}
                    className={`voice-option ${isInstalled ? 'installed' : ''} ${isActive ? 'selected' : ''}`}
                    onClick={() => isInstalled && setActiveWhisperModel(model.value)}
                    style={{ cursor: isInstalled ? 'pointer' : 'default' }}
                  >
                    <div className="voice-info">
                      <span className="voice-label">{model.label}</span>
                      <span className="voice-desc">{model.desc}</span>
                    </div>
                    {isInstalled ? (
                      <span className="voice-status installed">{isActive ? '● Active' : 'Installed'}</span>
                    ) : (
                      <button
                        className="voice-install-btn"
                        onClick={(e) => { e.stopPropagation(); handleInstallWhisperModel(model.value) }}
                        disabled={isInstalling}
                      >
                        {isInstalling ? 'Installing...' : 'Install'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="form-group">
            <label>Voice Output (Text-to-Speech)</label>
            <p className="form-hint">
              Piper voices and XTTS clones for Claude to speak responses aloud.
            </p>
            <div className="voice-options">
              {voice.installedVoices.length > 0 ? (
                voice.installedVoices.map((v) => {
                  const isSelected = voice.selectedVoice === v.key
                  const isPlaying = ui.playingPreview === v.key
                  const isLoading = ui.previewLoading === v.key
                  return (
                    <div
                      key={v.key}
                      className={`voice-option installed ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleVoiceSelect(v.key, v.source)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="voice-info">
                        <span className="voice-label">{v.displayName}</span>
                        <span className="voice-desc">
                          {v.source === 'builtin' ? 'Built-in' : v.source === 'custom' ? 'Custom' : v.source === 'xtts' ? 'XTTS Clone' : 'Downloaded'}
                        </span>
                      </div>
                      <button
                        className={`voice-preview-btn ${isPlaying ? 'playing' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePreview(v.key, v.source)
                        }}
                        disabled={isLoading}
                        title={isPlaying ? 'Stop preview' : 'Play preview'}
                      >
                        {isLoading ? '...' : isPlaying ? '⏹' : '▶'}
                      </button>
                      <span className={`voice-status ${isSelected ? 'active' : 'installed'}`}>
                        {isSelected ? 'Active' : 'Installed'}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="voice-option">
                  <div className="voice-info">
                    <span className="voice-label">No voices installed</span>
                    <span className="voice-desc">Browse and download voices to get started</span>
                  </div>
                </div>
              )}
            </div>
            <button
              className="btn-secondary"
              onClick={() => setUI(prev => ({ ...prev, showVoiceBrowser: true }))}
              style={{ marginTop: '8px' }}
            >
              Browse Voices...
            </button>

            {/* Voice Speed */}
            <div className="slider-group" style={{ marginTop: '16px' }}>
              <div className="slider-header">
                <label>Speed</label>
                <span className="slider-value">{voice.ttsSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={voice.ttsSpeed}
                onChange={(e) => setVoice(prev => ({ ...prev, ttsSpeed: parseFloat(e.target.value) }))}
                className="slider"
              />
              <div className="slider-labels">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>

            {/* XTTS Quality Settings - only show when XTTS voice selected */}
            {voice.selectedEngine === 'xtts' && (
              <div className="xtts-settings" style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <label style={{ marginBottom: '12px', display: 'block', fontWeight: 600 }}>XTTS Quality Settings</label>

                <div className="slider-group">
                  <div className="slider-header">
                    <label>Temperature</label>
                    <span className="slider-value">{xtts.temperature.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={xtts.temperature}
                    onChange={(e) => setXtts(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>Consistent</span>
                    <span>Expressive</span>
                  </div>
                </div>

                <div className="slider-group" style={{ marginTop: '12px' }}>
                  <div className="slider-header">
                    <label>Top-P</label>
                    <span className="slider-value">{xtts.topP.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={xtts.topP}
                    onChange={(e) => setXtts(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>Focused</span>
                    <span>Diverse</span>
                  </div>
                </div>

                <div className="slider-group" style={{ marginTop: '12px' }}>
                  <div className="slider-header">
                    <label>Repetition Penalty</label>
                    <span className="slider-value">{xtts.repetitionPenalty.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.5"
                    value={xtts.repetitionPenalty}
                    onChange={(e) => setXtts(prev => ({ ...prev, repetitionPenalty: parseFloat(e.target.value) }))}
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>Allow</span>
                    <span>Penalize</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Uninstall TTS</label>
            <p className="form-hint">
              Remove TTS voice output instructions from CLAUDE.md files in all projects.
              Use this if you want to stop using Claude Terminal altogether.
            </p>
            <button
              className="btn-danger"
              onClick={handleRemoveTTSFromAllProjects}
              disabled={ui.removingTTS}
              style={{ marginTop: '8px' }}
            >
              {ui.removingTTS ? 'Removing...' : 'Remove TTS from All Projects'}
            </button>
            {ui.ttsRemovalResult && (
              <p className="form-hint" style={{ marginTop: '8px', color: ui.ttsRemovalResult.failed > 0 ? 'var(--warning)' : 'var(--success)' }}>
                Removed from {ui.ttsRemovalResult.success} project{ui.ttsRemovalResult.success !== 1 ? 's' : ''}.
                {ui.ttsRemovalResult.failed > 0 && ` Failed: ${ui.ttsRemovalResult.failed}.`}
              </p>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <a
            href="https://ko-fi.com/donutsdelivery"
            target="_blank"
            rel="noopener noreferrer"
            className="kofi-link"
            onClick={(e) => {
              e.preventDefault()
              window.electronAPI.openExternal?.('https://ko-fi.com/donutsdelivery')
            }}
          >
            ♥ Support on Ko-fi
          </a>
          <div className="modal-footer-buttons">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>

      <VoiceBrowserModal
        isOpen={ui.showVoiceBrowser}
        onClose={() => {
          setUI(prev => ({ ...prev, showVoiceBrowser: false }))
          refreshInstalledVoices()
        }}
        onVoiceSelect={(voiceKey, engine) => {
          setVoice(prev => ({
            ...prev,
            selectedVoice: voiceKey,
            selectedEngine: engine === 'xtts' ? 'xtts' : 'piper'
          }))
          window.electronAPI.voiceSetVoice?.({ voice: voiceKey, engine })
        }}
      />
    </div>
  )
}
