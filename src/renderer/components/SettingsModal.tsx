import React, { useState, useEffect } from 'react'
import { themes, getThemeById, applyTheme, Theme } from '../themes'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onThemeChange: (theme: Theme) => void
}

export function SettingsModal({ isOpen, onClose, onThemeChange }: SettingsModalProps) {
  const [defaultProjectDir, setDefaultProjectDir] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('default')

  useEffect(() => {
    if (isOpen) {
      window.electronAPI.getSettings().then((settings) => {
        setDefaultProjectDir(settings.defaultProjectDir || '')
        setSelectedTheme(settings.theme || 'default')
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
    await window.electronAPI.saveSettings({ defaultProjectDir, theme: selectedTheme })
    onClose()
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
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
