import React, { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { Theme } from '../themes'

// Custom paste handler for xterm
async function handlePaste(term: XTerm, ptyId: string) {
  try {
    const text = await navigator.clipboard.readText()
    window.electronAPI.writePty(ptyId, text)
  } catch (e) {
    console.error('Failed to paste:', e)
  }
}

// Custom copy handler for xterm
function handleCopy(term: XTerm) {
  const selection = term.getSelection()
  if (selection) {
    navigator.clipboard.writeText(selection).catch(e => {
      console.error('Failed to copy:', e)
    })
  }
}

interface TerminalProps {
  ptyId: string
  isActive: boolean
  theme: Theme
  onFocus?: () => void
}

export function Terminal({ ptyId, isActive, theme, onFocus }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const t = theme.terminal
    const terminal = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
      scrollback: 10000,
      allowProposedApi: true,
      cols: 120,
      rows: 30,
      theme: {
        background: t.background,
        foreground: t.foreground,
        cursor: t.cursor,
        cursorAccent: t.cursorAccent,
        selectionBackground: t.selection,
        black: t.black,
        red: t.red,
        green: t.green,
        yellow: t.yellow,
        blue: t.blue,
        magenta: t.magenta,
        cyan: t.cyan,
        white: t.white,
        brightBlack: t.brightBlack,
        brightRed: t.brightRed,
        brightGreen: t.brightGreen,
        brightYellow: t.brightYellow,
        brightBlue: t.brightBlue,
        brightMagenta: t.brightMagenta,
        brightCyan: t.brightCyan,
        brightWhite: t.brightWhite
      }
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)

    terminal.open(containerRef.current)

    terminalRef.current = terminal
    fitAddonRef.current = fitAddon

    // Defer fit to next frame when container has dimensions
    requestAnimationFrame(() => {
      fitAddon.fit()
    })

    // Handle terminal input
    terminal.onData((data) => {
      window.electronAPI.writePty(ptyId, data)
    })

    // Handle copy/paste keyboard shortcuts and prevent arrow key scrolling
    terminal.attachCustomKeyEventHandler((event) => {
      // Only handle keydown events to prevent double-firing
      if (event.type !== 'keydown') return true

      // Ctrl+Shift+C for copy
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        handleCopy(terminal)
        return false
      }
      // Ctrl+Shift+V or Ctrl+V for paste
      if (event.ctrlKey && (event.key === 'V' || event.key === 'v')) {
        event.preventDefault()  // Prevent browser's native paste (which would cause duplicate)
        handlePaste(terminal, ptyId)
        return false
      }

      // Prevent arrow keys from scrolling the viewport
      // They still get sent to the PTY via onData for Claude's interactive prompts
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        // Send the escape sequence manually to ensure it reaches PTY
        const seq = event.key === 'ArrowUp' ? '\x1b[A' : '\x1b[B'
        window.electronAPI.writePty(ptyId, seq)
        return false  // Prevent xterm from also handling it (which causes scrolling)
      }

      // Ctrl+C without shift should pass through to terminal
      return true
    })

    // Right-click: copy if selection, else paste
    containerRef.current.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      const selection = terminal.getSelection()
      if (selection) {
        navigator.clipboard.writeText(selection)
      } else {
        // No selection - paste
        handlePaste(terminal, ptyId)
      }
    })

    // Middle-click paste (Linux style)
    containerRef.current.addEventListener('auxclick', (e) => {
      if (e.button === 1) {  // Middle button
        e.preventDefault()
        handlePaste(terminal, ptyId)
      }
    })

    // Prevent scroll jump on click - save and restore position
    containerRef.current.addEventListener('mousedown', (e) => {
      // Save scroll position before click processing
      const buffer = terminal.buffer.active
      const savedViewportY = buffer.viewportY
      const wasAtBottom = buffer.viewportY >= buffer.baseY

      // Restore scroll position after a brief delay (after xterm processes the click)
      requestAnimationFrame(() => {
        const newBuffer = terminal.buffer.active
        // Only restore if scroll position changed unexpectedly (not from wheel scroll)
        if (!wasAtBottom && newBuffer.viewportY !== savedViewportY) {
          terminal.scrollToLine(savedViewportY)
        }
      })
    })

    // Handle PTY output
    let firstData = true
    const cleanupData = window.electronAPI.onPtyData(ptyId, (data) => {
      // Check if already at bottom before writing (to preserve scroll position if user scrolled up)
      const buffer = terminal.buffer.active
      const atBottom = buffer.viewportY >= buffer.baseY

      terminal.write(data)

      // Only auto-scroll if we were already at the bottom
      if (atBottom) {
        terminal.scrollToBottom()
      }

      // Resize on first data to ensure PTY has correct dimensions
      if (firstData) {
        firstData = false
        handleResize()
      }
    })

    // Handle PTY exit
    const cleanupExit = window.electronAPI.onPtyExit(ptyId, (code) => {
      terminal.write(`\r\n\x1b[90m[Process exited with code ${code}]\x1b[0m\r\n`)
    })

    // Handle resize - preserve scroll position
    const handleResize = () => {
      if (!fitAddonRef.current || !containerRef.current || !terminalRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      // Only fit if container is visible and has dimensions
      if (rect.width > 0 && rect.height > 0) {
        // Save scroll position before resize
        const buffer = terminalRef.current.buffer.active
        const wasAtBottom = buffer.viewportY >= buffer.baseY
        const scrollOffset = buffer.baseY - buffer.viewportY

        fitAddonRef.current.fit()
        const dims = fitAddonRef.current.proposeDimensions()
        if (dims && dims.cols > 0 && dims.rows > 0) {
          console.log('Terminal resize:', dims.cols, 'x', dims.rows)
          window.electronAPI.resizePty(ptyId, dims.cols, dims.rows)
        }

        // Restore scroll position after resize
        if (wasAtBottom) {
          terminalRef.current.scrollToBottom()
        } else {
          // Try to maintain the same relative scroll position
          const newBuffer = terminalRef.current.buffer.active
          const targetY = Math.max(0, newBuffer.baseY - scrollOffset)
          terminalRef.current.scrollToLine(targetY)
        }
      }
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(containerRef.current)

    // Initial resize - multiple attempts to ensure correct sizing
    requestAnimationFrame(handleResize)
    setTimeout(handleResize, 100)
    setTimeout(handleResize, 300)
    setTimeout(handleResize, 500)

    return () => {
      cleanupData()
      cleanupExit()
      resizeObserver.disconnect()
      terminal.dispose()
    }
  }, [ptyId])

  // Refit when tab becomes active - preserve scroll position
  useEffect(() => {
    if (isActive && fitAddonRef.current && containerRef.current && terminalRef.current) {
      // Multiple fit attempts to handle visibility timing
      const doFit = () => {
        if (!fitAddonRef.current || !containerRef.current || !terminalRef.current) return

        // Ensure container has dimensions before fitting
        const rect = containerRef.current.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          // Save scroll position
          const buffer = terminalRef.current.buffer.active
          const wasAtBottom = buffer.viewportY >= buffer.baseY
          const scrollOffset = buffer.baseY - buffer.viewportY

          fitAddonRef.current.fit()
          const dims = fitAddonRef.current.proposeDimensions()
          if (dims && dims.cols > 0 && dims.rows > 0) {
            window.electronAPI.resizePty(ptyId, dims.cols, dims.rows)
          }

          // Restore scroll position
          if (wasAtBottom) {
            terminalRef.current.scrollToBottom()
          } else {
            const newBuffer = terminalRef.current.buffer.active
            const targetY = Math.max(0, newBuffer.baseY - scrollOffset)
            terminalRef.current.scrollToLine(targetY)
          }
        }
        terminalRef.current?.focus()
      }

      requestAnimationFrame(doFit)
      setTimeout(doFit, 50)
      setTimeout(doFit, 150)
      setTimeout(doFit, 300)
    }
  }, [isActive, ptyId])

  // Update terminal theme when theme changes
  useEffect(() => {
    if (terminalRef.current) {
      const t = theme.terminal
      terminalRef.current.options.theme = {
        background: t.background,
        foreground: t.foreground,
        cursor: t.cursor,
        cursorAccent: t.cursorAccent,
        selectionBackground: t.selection,
        black: t.black,
        red: t.red,
        green: t.green,
        yellow: t.yellow,
        blue: t.blue,
        magenta: t.magenta,
        cyan: t.cyan,
        white: t.white,
        brightBlack: t.brightBlack,
        brightRed: t.brightRed,
        brightGreen: t.brightGreen,
        brightYellow: t.brightYellow,
        brightBlue: t.brightBlue,
        brightMagenta: t.brightMagenta,
        brightCyan: t.brightCyan,
        brightWhite: t.brightWhite
      }
    }
  }, [theme])

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} onMouseDown={onFocus} />
}
