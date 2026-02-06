import { useMemo, useEffect, useRef, MutableRefObject } from 'react'
import type { TileLayout } from '../tiled-layout-utils.js'
import {
  generateDefaultLayout,
  validateLayout,
  removeTilePreservingStructure,
  addTileToLayout
} from '../tiled-layout-utils.js'
import type { OpenTab } from './types.js'

export function useEffectiveLayout(
  layout: TileLayout[],
  tabs: OpenTab[],
  containerSizeRef: MutableRefObject<{ width: number; height: number }>,
  onLayoutChange: (layout: TileLayout[]) => void
): {
  effectiveLayout: TileLayout[]
  effectiveLayoutRef: MutableRefObject<TileLayout[]>
  activeTabIdRef: MutableRefObject<string | null>
} {
  const effectiveLayoutRef = useRef<TileLayout[]>([])
  const activeTabIdRef = useRef<string | null>(tabs.length > 0 ? tabs[tabs.length - 1].id : null)

  const effectiveLayout = useMemo(() => {
    const { width, height } = containerSizeRef.current

    if (layout.length === 0) {
      return generateDefaultLayout(tabs, width, height)
    }

    const layoutIds = new Set(layout.map(l => l.id))
    const tabIds = new Set(tabs.map(t => t.id))
    const addedTabs = tabs.filter(t => !layoutIds.has(t.id))
    const removedIds = layout.filter(l => !tabIds.has(l.id)).map(l => l.id)

    if (addedTabs.length === 0 && removedIds.length === 0) {
      return validateLayout(layout, tabs, width, height)
    }

    let newLayout = [...layout]

    for (const removedId of removedIds) {
      newLayout = removeTilePreservingStructure(newLayout, removedId, tabs, width, height)
    }

    for (const addedTab of addedTabs) {
      const existingIds = newLayout.map(l => l.id)
      const activeId = existingIds.length > 0 ? existingIds[existingIds.length - 1] : null
      newLayout = addTileToLayout(newLayout, addedTab.id, activeId, width, height)
    }

    if (tabs.length > 0) {
      activeTabIdRef.current = tabs[tabs.length - 1].id
    }

    return validateLayout(newLayout, tabs, width, height)
  }, [layout, tabs, containerSizeRef])

  effectiveLayoutRef.current = effectiveLayout

  useEffect(() => {
    const layoutIds = new Set(layout.map(l => l.id))
    const effectiveIds = new Set(effectiveLayout.map(l => l.id))
    const idsMatch = layoutIds.size === effectiveIds.size && [...layoutIds].every(id => effectiveIds.has(id))

    if (!idsMatch) {
      onLayoutChange(effectiveLayout)
    }
  }, [effectiveLayout, layout, onLayoutChange])

  return { effectiveLayout, effectiveLayoutRef, activeTabIdRef }
}
