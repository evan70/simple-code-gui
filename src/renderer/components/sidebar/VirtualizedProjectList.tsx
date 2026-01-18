import React, { useCallback, useRef, useEffect, ReactNode } from 'react'
import { VariableSizeList as List } from 'react-window'
import { Project } from '../../stores/workspace.js'
import { ClaudeSession } from './types.js'

// Base height for a collapsed project item (padding + content)
const PROJECT_ITEM_HEIGHT = 52
// Height of "New Session" row
const NEW_SESSION_HEIGHT = 30
// Height per session item
const SESSION_ITEM_HEIGHT = 30
// Sessions list padding (top + bottom)
const SESSIONS_LIST_PADDING = 16

interface VirtualizedProjectListProps {
  projects: Project[]
  expandedProject: string | null
  sessions: Record<string, ClaudeSession[]>
  renderItem: (project: Project) => ReactNode
  maxHeight?: number
}

export const VirtualizedProjectList = React.memo(function VirtualizedProjectList({
  projects,
  expandedProject,
  sessions,
  renderItem,
  maxHeight = 600,
}: VirtualizedProjectListProps) {
  const listRef = useRef<List>(null)
  const prevExpandedRef = useRef<string | null>(null)

  // Calculate item height based on whether it's expanded
  const getItemSize = useCallback((index: number): number => {
    const project = projects[index]
    if (!project) return PROJECT_ITEM_HEIGHT

    if (expandedProject === project.path) {
      const sessionCount = sessions[project.path]?.length || 0
      // Project item + sessions list with new session button + all sessions
      return PROJECT_ITEM_HEIGHT + SESSIONS_LIST_PADDING + NEW_SESSION_HEIGHT + (sessionCount * SESSION_ITEM_HEIGHT)
    }

    return PROJECT_ITEM_HEIGHT
  }, [projects, expandedProject, sessions])

  // Reset cached sizes when expanded project changes
  useEffect(() => {
    if (listRef.current && prevExpandedRef.current !== expandedProject) {
      listRef.current.resetAfterIndex(0)
      prevExpandedRef.current = expandedProject
    }
  }, [expandedProject])

  // Also reset when sessions change (new sessions may be loaded)
  useEffect(() => {
    if (listRef.current && expandedProject) {
      listRef.current.resetAfterIndex(0)
    }
  }, [sessions, expandedProject])

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const project = projects[index]
    if (!project) return null

    return (
      <div style={style}>
        {renderItem(project)}
      </div>
    )
  }, [projects, renderItem])

  // Don't use virtualization for small lists (less overhead)
  if (projects.length <= 15) {
    return <>{projects.map(renderItem)}</>
  }

  // Calculate total height needed and cap it
  const totalHeight = projects.reduce((sum, _, index) => sum + getItemSize(index), 0)
  const listHeight = Math.min(totalHeight, maxHeight)

  return (
    <List
      ref={listRef}
      height={listHeight}
      itemCount={projects.length}
      itemSize={getItemSize}
      width="100%"
      overscanCount={5}
      style={{ overflow: 'auto' }}
    >
      {Row}
    </List>
  )
})
