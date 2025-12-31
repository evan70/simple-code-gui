import React, { useState, useEffect } from 'react'
import { themes, getThemeById, applyTheme, Theme } from '../themes'

// Common tool patterns for quick selection
const COMMON_TOOLS = [
  { label: 'Read files', value: 'Read' },
  { label: 'Write files', value: 'Write' },
  { label: 'Edit files', value: 'Edit' },
  { label: 'Git commands', value: 'Bash(git:*)' },
  { label: 'Grep search', value: 'Grep' },
  { label: 'Glob search', value: 'Glob' },
  { label: 'npm commands', value: 'Bash(npm:*)' },
  { label: 'All Bash', value: 'Bash' },
]

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onThemeChange: (theme: Theme) => void
}

export function SettingsModal({ isOpen, onClose, onThemeChange }: SettingsModalProps) {
  const [defaultProjectDir, setDefaultProjectDir] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('default')
  const [autoAcceptTools, setAutoAcceptTools] = useState<string[]>([])
  const [customTool, setCustomTool] = useState('')

  useEffect(() => {
    if (isOpen) {
      window.electronAPI.getSettings().then((settings) => {
        setDefaultProjectDir(settings.defaultProjectDir || '')
        setSelectedTheme(settings.theme || 'default')
        setAutoAcceptTools(settings.autoAcceptTools || [])
      })
    }
  }, [isOpen])

  const handleSelectDirectory = async () => {
    const dir = await window.electronAPI.selectDirectory()
    if (dir) {
      setDefaultProjectDir(dir)
    }
  }

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId)
    const theme = getThemeById(themeId)
    applyTheme(theme)
    onThemeChange(theme)
  }

  const handleSave = async () => {
    await window.electronAPI.saveSettings({ defaultProjectDir, theme: selectedTheme, autoAcceptTools })
    onClose()
  }

  const toggleTool = (tool: string) => {
    if (autoAcceptTools.includes(tool)) {
      setAutoAcceptTools(autoAcceptTools.filter(t => t !== tool))
    } else {
      setAutoAcceptTools([...autoAcceptTools, tool])
    }
  }

  const addCustomTool = () => {
    const trimmed = customTool.trim()
    if (trimmed && !autoAcceptTools.includes(trimmed)) {
      setAutoAcceptTools([...autoAcceptTools, trimmed])
      setCustomTool('')
    }
  }

  const removeCustomTool = (tool: string) => {
    setAutoAcceptTools(autoAcceptTools.filter(t => t !== tool))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
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
                  className={`theme-swatch ${selectedTheme === theme.id ? 'selected' : ''}`}
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
                value={defaultProjectDir}
                onChange={(e) => setDefaultProjectDir(e.target.value)}
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
            <label>Auto-Accept Permissions</label>
            <p className="form-hint">
              Select tools that Claude can use without asking for permission.
            </p>
            <div className="tool-chips">
              {COMMON_TOOLS.map((tool) => (
                <button
                  key={tool.value}
                  className={`tool-chip ${autoAcceptTools.includes(tool.value) ? 'selected' : ''}`}
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
                value={customTool}
                onChange={(e) => setCustomTool(e.target.value)}
                placeholder="Custom pattern (e.g., Bash(python:*))"
                onKeyDown={(e) => e.key === 'Enter' && addCustomTool()}
              />
              <button className="browse-btn" onClick={addCustomTool}>
                Add
              </button>
            </div>
            {autoAcceptTools.filter(t => !COMMON_TOOLS.some(ct => ct.value === t)).length > 0 && (
              <div className="custom-tools-list">
                {autoAcceptTools.filter(t => !COMMON_TOOLS.some(ct => ct.value === t)).map((tool) => (
                  <span key={tool} className="custom-tool-tag">
                    {tool}
                    <button onClick={() => removeCustomTool(tool)}>x</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
