import React, { createContext, useContext, useState, useCallback } from 'react'

interface ModalContextValue {
  settingsOpen: boolean
  makeProjectOpen: boolean
  openSettings: () => void
  closeSettings: () => void
  openMakeProject: () => void
  closeMakeProject: () => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [makeProjectOpen, setMakeProjectOpen] = useState(false)

  const openSettings = useCallback(() => setSettingsOpen(true), [])
  const closeSettings = useCallback(() => setSettingsOpen(false), [])
  const openMakeProject = useCallback(() => setMakeProjectOpen(true), [])
  const closeMakeProject = useCallback(() => setMakeProjectOpen(false), [])

  return (
    <ModalContext.Provider value={{
      settingsOpen,
      makeProjectOpen,
      openSettings,
      closeSettings,
      openMakeProject,
      closeMakeProject
    }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModals() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModals must be used within a ModalProvider')
  }
  return context
}
