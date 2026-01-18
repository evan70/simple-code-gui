import { ipcMain } from 'electron'
import { extensionManager, Extension } from '../extension-manager'

export function registerExtensionHandlers() {
  // Registry
  ipcMain.handle('extensions:fetchRegistry', async (_, forceRefresh?: boolean) => {
    try {
      return await extensionManager.fetchRegistry(forceRefresh)
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('extensions:fetchFromUrl', async (_, url: string) => {
    try {
      return await extensionManager.fetchFromUrl(url)
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  // Installation
  ipcMain.handle('extensions:installSkill', async (_, { extension, scope, projectPath }: { extension: Extension; scope?: 'global' | 'project'; projectPath?: string }) => {
    try {
      return await extensionManager.installSkill(extension, scope, projectPath)
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('extensions:installMcp', async (_, { extension, config }: { extension: Extension; config?: Record<string, any> }) => {
    try {
      return await extensionManager.installMcp(extension, config)
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('extensions:remove', async (_, extensionId: string) => {
    try {
      return await extensionManager.remove(extensionId)
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('extensions:update', async (_, extensionId: string) => {
    try {
      return await extensionManager.update(extensionId)
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  // Query
  ipcMain.handle('extensions:getInstalled', async () => {
    try {
      return await extensionManager.getInstalled()
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('extensions:getForProject', async (_, projectPath: string) => {
    try {
      return await extensionManager.getInstalledForProject(projectPath)
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('extensions:getCommands', async (_, projectPath: string) => {
    try {
      return await extensionManager.getCommandsForProject(projectPath)
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  // Config
  ipcMain.handle('extensions:getConfig', async (_, extensionId: string) => {
    try {
      return await extensionManager.getConfig(extensionId)
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('extensions:setConfig', async (_, { extensionId, config }: { extensionId: string; config: Record<string, any> }) => {
    try {
      return await extensionManager.setConfig(extensionId, config)
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('extensions:enableForProject', async (_, { extensionId, projectPath }: { extensionId: string; projectPath: string }) => {
    try {
      return await extensionManager.enableForProject(extensionId, projectPath)
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('extensions:disableForProject', async (_, { extensionId, projectPath }: { extensionId: string; projectPath: string }) => {
    try {
      return await extensionManager.disableForProject(extensionId, projectPath)
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  // Custom URLs
  ipcMain.handle('extensions:addCustomUrl', async (_, url: string) => {
    try {
      extensionManager.addCustomUrl(url)
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('extensions:removeCustomUrl', async (_, url: string) => {
    try {
      extensionManager.removeCustomUrl(url)
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('extensions:getCustomUrls', async () => {
    try {
      return extensionManager.getCustomUrls()
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })
}
