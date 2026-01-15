import { ipcMain, BrowserWindow, clipboard } from 'electron'
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir, homedir } from 'os'
import { isWindows } from '../platform'

export function registerWindowHandlers(getMainWindow: () => BrowserWindow | null) {
  ipcMain.handle('window:minimize', () => {
    getMainWindow()?.minimize()
  })

  ipcMain.handle('window:maximize', () => {
    const mainWindow = getMainWindow()
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.handle('window:close', () => {
    getMainWindow()?.close()
  })

  ipcMain.handle('window:isMaximized', () => {
    return getMainWindow()?.isMaximized() ?? false
  })

  // Clipboard
  ipcMain.handle('clipboard:readImage', async () => {
    try {
      const formats = clipboard.availableFormats()

      // Check for text/uri-list (Linux file copy)
      if (formats.includes('text/uri-list')) {
        const uriBuffer = clipboard.readBuffer('text/uri-list')
        const uriList = uriBuffer.toString('utf8').trim()
        if (uriList) {
          const paths = uriList.split('\n')
            .map(uri => uri.trim())
            .filter(uri => uri.startsWith('file://'))
            .map(uri => decodeURIComponent(uri.replace('file://', '')))
          if (paths.length > 0) {
            return { success: true, hasImage: true, path: paths.join(' '), isFile: true }
          }
        }
      }

      // Check for Windows file copy
      if (isWindows) {
        try {
          const rawFilePath = clipboard.read('FileNameW')
          if (rawFilePath) {
            const filePath = rawFilePath.replace(new RegExp(String.fromCharCode(0), 'g'), '').trim()
            if (filePath && (filePath.includes(':\\') || filePath.startsWith('\\\\'))) {
              return { success: true, hasImage: true, path: filePath, isFile: true }
            }
          }
        } catch { /* FileNameW not available */ }

        try {
          const hdropBuffer = clipboard.readBuffer('CF_HDROP')
          if (hdropBuffer && hdropBuffer.length > 0) {
            const hdropStr = hdropBuffer.toString('ucs2').replace(/\0+/g, '\n').trim()
            const lines = hdropStr.split('\n').filter(l => l.includes(':\\') || l.startsWith('\\\\'))
            if (lines.length > 0) {
              return { success: true, hasImage: true, path: lines.join(' '), isFile: true }
            }
          }
        } catch { /* CF_HDROP not available */ }
      }

      // Try to get image from clipboard
      const image = clipboard.readImage()
      if (image.isEmpty()) {
        const html = clipboard.readHTML()
        if (html && html.includes('<img')) {
          const srcMatch = html.match(/src="([^"]+)"/)
          if (srcMatch && srcMatch[1]) {
            return { success: true, hasImage: true, path: srcMatch[1], isUrl: true }
          }
        }
        return { success: false, hasImage: false }
      }

      // Save to temp file
      const filename = `clipboard-${Date.now()}.png`
      const filepath = join(tmpdir(), filename)
      const pngBuffer = image.toPNG()
      writeFileSync(filepath, pngBuffer)

      return { success: true, hasImage: true, path: filepath }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  // Custom commands
  ipcMain.handle('commands:save', async (_, { name, content, projectPath }: { name: string; content: string; projectPath: string | null }) => {
    try {
      let commandsDir: string
      if (projectPath) {
        commandsDir = join(projectPath, '.claude', 'commands')
      } else {
        commandsDir = join(homedir(), '.claude', 'commands')
      }

      if (!existsSync(commandsDir)) {
        mkdirSync(commandsDir, { recursive: true })
      }

      const filePath = join(commandsDir, `${name}.md`)
      if (existsSync(filePath)) {
        return { success: false, error: `Command "${name}" already exists` }
      }

      writeFileSync(filePath, content, 'utf8')
      return { success: true, path: filePath }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // CLAUDE.md editor
  ipcMain.handle('claudemd:read', async (_, projectPath: string) => {
    try {
      const claudeMdPath = join(projectPath, '.claude', 'CLAUDE.md')
      if (existsSync(claudeMdPath)) {
        const content = readFileSync(claudeMdPath, 'utf8')
        return { success: true, content, exists: true }
      }
      return { success: true, content: '', exists: false }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('claudemd:save', async (_, { projectPath, content }: { projectPath: string; content: string }) => {
    try {
      const claudeDir = join(projectPath, '.claude')
      const claudeMdPath = join(claudeDir, 'CLAUDE.md')

      if (!existsSync(claudeDir)) {
        mkdirSync(claudeDir, { recursive: true })
      }

      writeFileSync(claudeMdPath, content, 'utf8')
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })
}
