import React, { useCallback, memo } from 'react'
import { OpenTab } from '../stores/workspace'

interface TabItemProps {
  tab: OpenTab
  isActive: boolean
  onSelect: (id: string) => void
  onClose: (id: string) => void
}

const TabItem = memo(function TabItem({ tab, isActive, onSelect, onClose }: TabItemProps) {
  const handleClick = useCallback(() => {
    onSelect(tab.id)
  }, [onSelect, tab.id])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(tab.id)
    }
  }, [onSelect, tab.id])

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onClose(tab.id)
  }, [onClose, tab.id])

  return (
    <div
      className={`tab ${isActive ? 'active' : ''}`}
      role="tab"
      aria-selected={isActive}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className="tab-title" title={tab.title}>{tab.title}</span>
      <button
        className="tab-close"
        onClick={handleClose}
        title="Close tab"
        aria-label="Close tab"
      >
        ×
      </button>
    </div>
  )
})

interface TerminalTabsProps {
  tabs: OpenTab[]
  activeTabId: string | null
  onSelectTab: (id: string) => void
  onCloseTab: (id: string) => void
}

export function TerminalTabs({ tabs, activeTabId, onSelectTab, onCloseTab }: TerminalTabsProps) {
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (tabs.length <= 1) return

    const currentIndex = tabs.findIndex(t => t.id === activeTabId)
    if (currentIndex === -1) return

    // Scroll down (positive deltaY) = next tab, scroll up = previous tab
    const direction = e.deltaY > 0 ? 1 : -1
    const newIndex = (currentIndex + direction + tabs.length) % tabs.length
    onSelectTab(tabs[newIndex].id)
  }, [tabs, activeTabId, onSelectTab])

  return (
    <div className="tabs-bar" onWheel={handleWheel} role="tablist" aria-label="Terminal sessions">
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
          onSelect={onSelectTab}
          onClose={onCloseTab}
        />
      ))}
    </div>
  )
}
