import React, { useState, useRef, useEffect } from 'react'
import type { TileLayout, DropZone } from '../tiled-layout-utils.js'
import type { TiledTerminalViewProps, TileResizeState } from './types.js'
import { useEffectiveLayout } from './useEffectiveLayout.js'
import { useStartTileResize, useTileResizeEffect } from './useTileResizing.js'
import {
  useHandleDragStart,
  useHandleContainerDragOver,
  useHandleContainerDragLeave,
  useApplyDropZone,
  useHandleContainerDrop,
  useHandleDragEnd
} from './useTileDragDrop.js'
import { useGetHighlightedEdges, useHighlightedEdges } from './useHighlightedEdges.js'
import { TileTerminal } from './TileTerminal.js'
import { DropZoneOverlay } from './DropZoneOverlay.js'

export type { TileLayout, DropZone } from '../tiled-layout-utils.js'
export { splitTile, addTileToLayout } from '../tiled-layout-utils.js'

const GAP = 4

export function TiledTerminalView({
  tabs,
  projects,
  theme,
  onCloseTab,
  onFocusTab,
  layout,
  onLayoutChange,
  onOpenSessionAtPosition,
  api
}: TiledTerminalViewProps): React.ReactElement | null {
  const containerRef = useRef<HTMLDivElement>(null)
  const containerSizeRef = useRef({ width: 1920, height: 1080 })
  const onLayoutChangeRef = useRef(onLayoutChange)
  onLayoutChangeRef.current = onLayoutChange

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          containerSizeRef.current = { width, height }
        }
      }
    })

    resizeObserver.observe(container)
    const rect = container.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      containerSizeRef.current = { width: rect.width, height: rect.height }
    }

    return () => resizeObserver.disconnect()
  }, [])

  const [draggedTile, setDraggedTile] = useState<string | null>(null)
  const [draggedSidebarProject, setDraggedSidebarProject] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [currentDropZone, setCurrentDropZone] = useState<DropZone | null>(null)
  const [tileResizing, setTileResizing] = useState<TileResizeState | null>(null)
  const [hoveredEdge, setHoveredEdge] = useState<{ tileId: string; edge: string } | null>(null)

  const { effectiveLayout, effectiveLayoutRef } = useEffectiveLayout(
    layout, tabs, containerSizeRef, onLayoutChange
  )

  // Force terminals to refit when tiled view mounts
  useEffect(() => {
    const triggerRefit = () => {
      window.dispatchEvent(new Event('resize'))
    }
    const timers = [
      setTimeout(triggerRefit, 100),
      setTimeout(triggerRefit, 300),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const startTileResize = useStartTileResize(effectiveLayout, setTileResizing, setHoveredEdge)
  useTileResizeEffect(tileResizing, containerRef, effectiveLayoutRef, onLayoutChangeRef, setTileResizing)

  const dragDropActions = {
    setDraggedTile,
    setDraggedSidebarProject,
    setDropTarget,
    setCurrentDropZone
  }

  const handleDragStart = useHandleDragStart(setDraggedTile)
  const handleContainerDragOver = useHandleContainerDragOver(
    containerRef, effectiveLayout,
    { draggedTile, draggedSidebarProject },
    dragDropActions
  )
  const handleContainerDragLeave = useHandleContainerDragLeave(containerRef, dragDropActions)
  const applyDropZone = useApplyDropZone(tabs, containerSizeRef)
  const handleContainerDrop = useHandleContainerDrop(
    containerRef, effectiveLayoutRef, containerSizeRef,
    tabs, onLayoutChange, applyDropZone, onOpenSessionAtPosition,
    dragDropActions
  )
  const handleDragEnd = useHandleDragEnd(dragDropActions)

  const getHighlightedEdges = useGetHighlightedEdges(effectiveLayout)
  const highlightedEdges = useHighlightedEdges(hoveredEdge, tileResizing, getHighlightedEdges)

  if (tabs.length === 0) return null

  return (
    <div
      ref={containerRef}
      className={`terminal-tiled-custom${tileResizing ? ' is-resizing' : ''}`}
      style={{ flex: 1, padding: `${GAP}px`, overflow: 'hidden', background: 'var(--bg-base)', position: 'relative' }}
      onDragOver={handleContainerDragOver}
      onDragLeave={handleContainerDragLeave}
      onDrop={handleContainerDrop}
    >
      {tileResizing && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 200, cursor: 'inherit' }} />
      )}
      {effectiveLayout.map((tile) => {
        const tab = tabs.find(t => t.id === tile.id)
        if (!tab) return null

        const project = projects.find(p => p.path === tab.projectPath)

        return (
          <TileTerminal
            key={tile.id}
            tile={tile}
            tab={tab}
            project={project}
            theme={theme}
            api={api}
            GAP={GAP}
            isDragging={draggedTile === tile.id}
            isDropTarget={dropTarget === tile.id}
            draggedTile={draggedTile}
            draggedSidebarProject={draggedSidebarProject}
            effectiveLayout={effectiveLayout}
            containerRef={containerRef}
            highlightedEdges={highlightedEdges}
            onCloseTab={onCloseTab}
            onFocusTab={onFocusTab}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onContainerDrop={handleContainerDrop}
            startTileResize={startTileResize}
            setHoveredEdge={setHoveredEdge}
            setDraggedSidebarProject={setDraggedSidebarProject}
            setCurrentDropZone={setCurrentDropZone}
            setDropTarget={setDropTarget}
          />
        )
      })}

      {(draggedTile || draggedSidebarProject) && currentDropZone && (
        <DropZoneOverlay
          currentDropZone={currentDropZone}
          draggedSidebarProject={draggedSidebarProject}
          GAP={GAP}
        />
      )}
    </div>
  )
}

export default TiledTerminalView
