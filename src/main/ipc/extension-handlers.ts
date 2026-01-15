import { ipcMain } from 'electron'
import { extensionManager, Extension } from '../extension-manager'

export function registerExtensionHandlers() {
  // Registry
  ipcMain.handle('extensions:fetchRegistry', async (_, forceRefresh?: boolean) => {
    return extensionManager.fetchRegistry(forceRefresh)
  })

  ipcMain.handle('extensions:fetchFromUrl', async (_, url: string) => {
    return extensionManager.fetchFromUrl(url)
  })

  // Installation
  ipcMain.handle('extensions:installSkill', async (_, { extension, scope, projectPath }: { extension: Extension; scope?: 'global' | 'project'; projectPath?: string }) => {
    return extensionManager.installSkill(extension, scope, projectPath)
  })

  ipcMain.handle('extensions:installMcp', async (_, { extension, config }: { extension: Extension; config?: Record<string, any> }) => {
    return extensionManager.installMcp(extension, config)
  })

  ipcMain.handle('extensions:remove', async (_, extensionId: string) => {
    return extensionManager.remove(extensionId)
  })

  ipcMain.handle('extensions:update', async (_, extensionId: string) => {
    return extensionManager.update(extensionId)
  })

  // Query
  ipcMain.handle('extensions:getInstalled', async () => {
    return extensionManager.getInstalled()
  })

  ipcMain.handle('extensions:getForProject', async (_, projectPath: string) => {
    return extensionManager.getInstalledForProject(projectPath)
  })

  ipcMain.handle('extensions:getCommands', async (_, projectPath: string) => {
    return extensionManager.getCommandsForProject(projectPath)
  })

  // Config
  ipcMain.handle('extensions:getConfig', async (_, extensionId: string) => {
    return extensionManager.getConfig(extensionId)
  })

  ipcMain.handle('extensions:setConfig', async (_, { extensionId, config }: { extensionId: string; config: Record<string, any> }) => {
    return extensionManager.setConfig(extensionId, config)
  })

  ipcMain.handle('extensions:enableForProject', async (_, { extensionId, projectPath }: { extensionId: string; projectPath: string }) => {
    return extensionManager.enableForProject(extensionId, projectPath)
  })

  ipcMain.handle('extensions:disableForProject', async (_, { extensionId, projectPath }: { extensionId: string; projectPath: string }) => {
    return extensionManager.disableForProject(extensionId, projectPath)
  })

  // Custom URLs
  ipcMain.handle('extensions:addCustomUrl', async (_, url: string) => {
    extensionManager.addCustomUrl(url)
    return { success: true }
  })

  ipcMain.handle('extensions:removeCustomUrl', async (_, url: string) => {
    extensionManager.removeCustomUrl(url)
    return { success: true }
  })

  ipcMain.handle('extensions:getCustomUrls', async () => {
    return extensionManager.getCustomUrls()
  })
}
