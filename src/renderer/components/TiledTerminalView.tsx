import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Terminal } from './Terminal'
import { Theme } from '../themes'

export interface TileLayout {
  id: string
  x: number      // Grid column (0-based)
  y: number      // Grid row (0-based)
  width: number  // Column span
  height: number // Row span
}

interface OpenTab {
  id: string
  projectPath: string
  sessionId?: string
  title: string
}

interface TiledTerminalViewProps {
  tabs: OpenTab[]
  theme: Theme
  onCloseTab: (id: string) => void
  onFocusTab: (id: string) => void
  layout: TileLayout[]
  onLayoutChange: (layout: TileLayout[]) => void
}

function generateDefaultLayout(tabs: OpenTab[]): TileLayout[] {
  const count = tabs.length
  if (count === 0) return []
  if (count === 1) {
    return [{ id: tabs[0].id, x: 0, y: 0, width: 2, height: 2 }]
  }
  if (count === 2) {
    return [
      { id: tabs[0].id, x: 0, y: 0, width: 1, height: 2 },
      { id: tabs[1].id, x: 1, y: 0, width: 1, height: 2 }
    ]
  }
  if (count === 3) {
    return [
      { id: tabs[0].id, x: 0, y: 0, width: 1, height: 2 },
      { id: tabs[1].id, x: 1, y: 0, width: 1, height: 1 },
      { id: tabs[2].id, x: 1, y: 1, width: 1, height: 1 }
    ]
  }
  // 4 or more: 2x2 grid, extras wrap
  return tabs.map((tab, i) => ({
    id: tab.id,
    x: i % 2,
    y: Math.floor(i / 2),
    width: 1,
    height: 1
  }))
}

export function TiledTerminalView({
  tabs,
  theme,
  onCloseTab,
  onFocusTab,
  layout,
  onLayoutChange
}: TiledTerminalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<{
    type: 'resize-h' | 'resize-v' | 'resize-corner'
    tileId: string
    startX: number
    startY: number
    initialLayout: TileLayout[]
  } | null>(null)
  const [draggedTile, setDraggedTile] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)

  // Generate default layout if none provided, or sync with tabs
  const effectiveLayout = React.useMemo(() => {
    if (layout.length === 0) {
      return generateDefaultLayout(tabs)
    }

    // Ensure all tabs have a layout entry
    const layoutIds = new Set(layout.map(l => l.id))
    const tabIds = new Set(tabs.map(t => t.id))

    // Remove layouts for closed tabs
    let newLayout = layout.filter(l => tabIds.has(l.id))

    // Add default positions for new tabs
    const newTabs = tabs.filter(t => !layoutIds.has(t.id))
    if (newTabs.length > 0) {
      const maxY = Math.max(0, ...newLayout.map(l => l.y + l.height))
      newTabs.forEach((tab, i) => {
        newLayout.push({
          id: tab.id,
          x: i % 2,
          y: maxY + Math.floor(i / 2),
          width: 1,
          height: 1
        })
      })
    }

    return newLayout
  }, [layout, tabs])

  // Calculate grid dimensions from layout
  const gridCols = Math.max(2, ...effectiveLayout.map(t => t.x + t.width))
  const gridRows = Math.max(2, ...effectiveLayout.map(t => t.y + t.height))

  // Handle mouse move for resize
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const cellWidth = rect.width / gridCols
    const cellHeight = rect.height / gridRows

    const deltaX = e.clientX - dragging.startX
    const deltaY = e.clientY - dragging.startY
    const deltaCols = Math.round(deltaX / cellWidth)
    const deltaRows = Math.round(deltaY / cellHeight)

    const newLayout = dragging.initialLayout.map(tile => {
      if (tile.id !== dragging.tileId) return tile

      let newWidth = tile.width
      let newHeight = tile.height

      if (dragging.type === 'resize-h' || dragging.type === 'resize-corner') {
        newWidth = Math.max(1, tile.width + deltaCols)
      }
      if (dragging.type === 'resize-v' || dragging.type === 'resize-corner') {
        newHeight = Math.max(1, tile.height + deltaRows)
      }

      return { ...tile, width: newWidth, height: newHeight }
    })

    onLayoutChange(newLayout)
  }, [dragging, gridCols, gridRows, onLayoutChange])

  const handleMouseUp = useCallback(() => {
    setDragging(null)
  }, [])

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragging, handleMouseMove, handleMouseUp])

  const startResize = (
    e: React.MouseEvent,
    tileId: string,
    direction: 'resize-h' | 'resize-v' | 'resize-corner'
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging({
      type: direction,
      tileId,
      startX: e.clientX,
      startY: e.clientY,
      initialLayout: [...effectiveLayout]
    })
  }

  // Drag and drop handlers for reordering
  const handleDragStart = (e: React.DragEvent, tileId: string) => {
    e.dataTransfer.setData('text/plain', tileId)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedTile(tileId)
  }

  const handleDragOver = (e: React.DragEvent, tileId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (tileId !== draggedTile) {
      setDropTarget(tileId)
    }
  }

  const handleDragLeave = () => {
    setDropTarget(null)
  }

  const handleDrop = (e: React.DragEvent, targetTileId: string) => {
    e.preventDefault()
    const sourceTileId = e.dataTransfer.getData('text/plain')

    if (sourceTileId && sourceTileId !== targetTileId) {
      const sourceLayout = effectiveLayout.find(t => t.id === sourceTileId)
      const targetLayout = effectiveLayout.find(t => t.id === targetTileId)

      if (sourceLayout && targetLayout) {
        // Swap positions
        const newLayout = effectiveLayout.map(tile => {
          if (tile.id === sourceTileId) {
            return { ...tile, x: targetLayout.x, y: targetLayout.y }
          }
          if (tile.id === targetTileId) {
            return { ...tile, x: sourceLayout.x, y: sourceLayout.y }
          }
          return tile
        })
        onLayoutChange(newLayout)
      }
    }

    setDraggedTile(null)
    setDropTarget(null)
  }

  const handleDragEnd = () => {
    setDraggedTile(null)
    setDropTarget(null)
  }

  if (tabs.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="terminal-tiled-custom"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gridTemplateRows: `repeat(${gridRows}, 1fr)`,
        gap: '2px',
        flex: 1,
        padding: '2px',
        overflow: 'hidden',
        background: 'var(--bg-base)'
      }}
    >
      {effectiveLayout.map((tile) => {
        const tab = tabs.find(t => t.id === tile.id)
        if (!tab) return null

        const isDragging = draggedTile === tile.id
        const isDropTarget = dropTarget === tile.id

        return (
          <div
            key={tile.id}
            className={`terminal-tile ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''}`}
            style={{
              gridColumn: `${tile.x + 1} / span ${tile.width}`,
              gridRow: `${tile.y + 1} / span ${tile.height}`,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              minHeight: 0
            }}
            onDragOver={(e) => handleDragOver(e, tile.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, tile.id)}
          >
            <div
              className="tile-header"
              draggable
              onDragStart={(e) => handleDragStart(e, tile.id)}
              onDragEnd={handleDragEnd}
              style={{ cursor: 'grab' }}
            >
              <span className="tile-title" title={tab.title}>{tab.title}</span>
              <button
                className="tile-close"
                onClick={() => onCloseTab(tab.id)}
                title="Close"
              >
                x
              </button>
            </div>
            <div className="tile-terminal">
              <div className="terminal-wrapper active">
                <Terminal
                  ptyId={tab.id}
                  isActive={true}
                  theme={theme}
                  onFocus={() => onFocusTab(tab.id)}
                />
              </div>
            </div>

            {/* Resize handles */}
            <div
              className="tile-resize-handle tile-resize-h"
              onMouseDown={(e) => startResize(e, tile.id, 'resize-h')}
            />
            <div
              className="tile-resize-handle tile-resize-v"
              onMouseDown={(e) => startResize(e, tile.id, 'resize-v')}
            />
            <div
              className="tile-resize-handle tile-resize-corner"
              onMouseDown={(e) => startResize(e, tile.id, 'resize-corner')}
            />
          </div>
        )
      })}
    </div>
  )
}
