import { ipcMain, BrowserWindow, dialog } from 'electron'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import { voiceManager, WHISPER_MODELS, PIPER_VOICES, WhisperModelName, PiperVoiceName } from '../voice-manager'
import { xttsManager, XTTS_LANGUAGES, XTTS_SAMPLE_VOICES } from '../xtts-manager'

const TTS_INSTRUCTIONS_START = '\n\n<!-- TTS_VOICE_OUTPUT_START -->'
const TTS_INSTRUCTIONS_END = '<!-- TTS_VOICE_OUTPUT_END -->\n'
const TTS_INSTRUCTIONS = `${TTS_INSTRUCTIONS_START}
## Voice Output (TTS)

When responding, wrap your natural language prose in \`«tts»...«/tts»\` markers for text-to-speech.

Rules:
- ONLY wrap conversational prose meant to be spoken aloud
- Do NOT wrap: code, file paths, commands, tool output, URLs, lists, errors
- Keep markers on same line as text (no line breaks inside)

Examples:
✓ «tts»I'll help you fix that bug.«/tts»
✓ «tts»The tests are passing.«/tts» Here's what changed:
✗ «tts»src/Header.tsx«/tts»  (file path - don't wrap)
✗ «tts»npm install«/tts»  (command - don't wrap)
${TTS_INSTRUCTIONS_END}`

function installTTSInstructions(projectPath: string): boolean {
  try {
    const claudeDir = join(projectPath, '.claude')
    const claudeMdPath = join(claudeDir, 'CLAUDE.md')

    if (!existsSync(claudeDir)) {
      mkdirSync(claudeDir, { recursive: true })
    }

    let content = ''
    if (existsSync(claudeMdPath)) {
      content = readFileSync(claudeMdPath, 'utf8')
      if (content.includes(TTS_INSTRUCTIONS_START)) {
        const startIdx = content.indexOf(TTS_INSTRUCTIONS_START)
        const endIdx = content.indexOf(TTS_INSTRUCTIONS_END)
        if (startIdx !== -1 && endIdx !== -1) {
          content = content.substring(0, startIdx) + content.substring(endIdx + TTS_INSTRUCTIONS_END.length)
          content += TTS_INSTRUCTIONS
          writeFileSync(claudeMdPath, content)
          return true
        }
      }
    }

    content += TTS_INSTRUCTIONS
    writeFileSync(claudeMdPath, content)
    return true
  } catch (e) {
    console.error('Failed to install TTS instructions:', e)
    return false
  }
}

function removeTTSInstructions(projectPath: string): boolean {
  try {
    const claudeMdPath = join(projectPath, '.claude', 'CLAUDE.md')
    if (!existsSync(claudeMdPath)) return true

    let content = readFileSync(claudeMdPath, 'utf8')
    const startIdx = content.indexOf(TTS_INSTRUCTIONS_START)
    const endIdx = content.indexOf(TTS_INSTRUCTIONS_END)

    if (startIdx !== -1 && endIdx !== -1) {
      content = content.slice(0, startIdx) + content.slice(endIdx + TTS_INSTRUCTIONS_END.length)
      content = content.trimEnd() + '\n'
      writeFileSync(claudeMdPath, content)
    }
    return true
  } catch (e) {
    console.error('Failed to remove TTS instructions:', e)
    return false
  }
}

export function registerVoiceHandlers(getMainWindow: () => BrowserWindow | null) {
  // TTS Instructions
  ipcMain.handle('tts:installInstructions', (_, projectPath: string) => {
    return { success: installTTSInstructions(projectPath) }
  })

  ipcMain.handle('tts:removeInstructions', (_, projectPath: string) => {
    return { success: removeTTSInstructions(projectPath) }
  })

  // Whisper (STT)
  ipcMain.handle('voice:checkWhisper', async () => {
    return voiceManager.checkWhisper()
  })

  ipcMain.handle('voice:installWhisper', async (_, model: WhisperModelName) => {
    return voiceManager.downloadWhisperModel(model, (status, percent) => {
      getMainWindow()?.webContents.send('install:progress', { type: 'whisper', status, percent })
    })
  })

  ipcMain.handle('voice:transcribe', async (_, pcmData: Float32Array) => {
    return voiceManager.transcribe(pcmData)
  })

  ipcMain.handle('voice:setWhisperModel', async (_, model: WhisperModelName) => {
    voiceManager.setWhisperModel(model)
    return { success: true }
  })

  // TTS
  ipcMain.handle('voice:checkTTS', async () => {
    return voiceManager.checkTTS()
  })

  ipcMain.handle('voice:installPiper', async () => {
    return voiceManager.installPiper((status, percent) => {
      getMainWindow()?.webContents.send('install:progress', { type: 'piper', status, percent })
    })
  })

  ipcMain.handle('voice:installVoice', async (_, voice: PiperVoiceName) => {
    return voiceManager.downloadPiperVoice(voice, (status, percent) => {
      getMainWindow()?.webContents.send('install:progress', { type: 'piper-voice', status, percent })
    })
  })

  ipcMain.handle('voice:speak', async (_, text: string) => {
    return voiceManager.speak(text)
  })

  ipcMain.handle('voice:stopSpeaking', async () => {
    voiceManager.stopSpeaking()
    return { success: true }
  })

  ipcMain.handle('voice:getVoices', async () => {
    const installed = voiceManager.getInstalledPiperVoices()
    const all = Object.entries(PIPER_VOICES).map(([id, info]) => ({
      id,
      description: info.description,
      license: info.license,
      installed: installed.includes(id)
    }))
    return { installed, all }
  })

  ipcMain.handle('voice:getWhisperModels', async () => {
    const installedModels = voiceManager.getInstalledWhisperModels()
    const all = Object.entries(WHISPER_MODELS).map(([id, info]) => ({
      id,
      size: info.size,
      installed: installedModels.includes(id as WhisperModelName)
    }))
    return { installed: installedModels, all }
  })

  ipcMain.handle('voice:setVoice', async (_, voice: string | { voice: string; engine: 'piper' | 'xtts' }) => {
    if (typeof voice === 'string') {
      voiceManager.setTTSVoice(voice)
    } else {
      voiceManager.setTTSVoice(voice.voice, voice.engine)
    }
    return { success: true }
  })

  ipcMain.handle('voice:getSettings', async () => {
    return voiceManager.getSettings()
  })

  ipcMain.handle('voice:applySettings', async (_, settings: any) => {
    voiceManager.applySettings(settings)
    return { success: true }
  })

  ipcMain.handle('voice:fetchCatalog', async () => {
    return await voiceManager.fetchVoicesCatalog()
  })

  ipcMain.handle('voice:downloadFromCatalog', async (_, voiceKey: string) => {
    return await voiceManager.downloadVoiceFromCatalog(voiceKey)
  })

  ipcMain.handle('voice:getInstalled', async () => {
    return voiceManager.getInstalledVoices()
  })

  ipcMain.handle('voice:importCustom', async () => {
    const result = await dialog.showOpenDialog(getMainWindow()!, {
      title: 'Select Piper Voice Model',
      filters: [{ name: 'ONNX Model', extensions: ['onnx'] }],
      properties: ['openFile']
    })

    if (result.canceled || !result.filePaths[0]) {
      return { success: false, error: 'No file selected' }
    }

    const onnxPath = result.filePaths[0]
    const configPath = onnxPath + '.json'
    if (!existsSync(configPath)) {
      return { success: false, error: 'Config file (.onnx.json) not found next to model file' }
    }

    return await voiceManager.importCustomVoiceFiles(onnxPath, configPath)
  })

  ipcMain.handle('voice:removeCustom', async (_, voiceKey: string) => {
    return voiceManager.removeCustomVoice(voiceKey)
  })

  ipcMain.handle('voice:openCustomFolder', async () => {
    const { shell } = require('electron')
    const customDir = voiceManager.getCustomVoicesDir()
    if (!existsSync(customDir)) {
      mkdirSync(customDir, { recursive: true })
    }
    shell.openPath(customDir)
  })

  // XTTS (voice cloning)
  ipcMain.handle('xtts:check', async () => {
    return await xttsManager.checkInstallation()
  })

  ipcMain.handle('xtts:install', async () => {
    return await xttsManager.install()
  })

  ipcMain.handle('xtts:createVoice', async (_, { audioPath, name, language }) => {
    return await xttsManager.createVoice(audioPath, name, language)
  })

  ipcMain.handle('xtts:getVoices', async () => {
    return xttsManager.getVoices()
  })

  ipcMain.handle('xtts:deleteVoice', async (_, voiceId: string) => {
    return xttsManager.deleteVoice(voiceId)
  })

  ipcMain.handle('xtts:speak', async (_, { text, voiceId, language }) => {
    return await xttsManager.speak(text, voiceId, language)
  })

  ipcMain.handle('xtts:selectAudio', async () => {
    const result = await dialog.showOpenDialog(getMainWindow()!, {
      title: 'Select Voice Sample Audio',
      filters: [{ name: 'Audio Files', extensions: ['wav', 'mp3', 'ogg', 'flac', 'm4a'] }],
      properties: ['openFile']
    })

    if (result.canceled || !result.filePaths[0]) {
      return { success: false, error: 'No file selected' }
    }

    return { success: true, path: result.filePaths[0] }
  })

  ipcMain.handle('xtts:getLanguages', async () => {
    return XTTS_LANGUAGES
  })

  ipcMain.handle('xtts:getSampleVoices', async () => {
    return XTTS_SAMPLE_VOICES.map(s => ({
      ...s,
      installed: xttsManager.isSampleVoiceInstalled(s.id)
    }))
  })

  ipcMain.handle('xtts:downloadSampleVoice', async (_, sampleId: string) => {
    return xttsManager.downloadSampleVoice(sampleId)
  })

  ipcMain.handle('xtts:getMediaDuration', async (_, filePath: string) => {
    return xttsManager.getMediaDuration(filePath)
  })

  ipcMain.handle('xtts:extractAudioClip', async (_, { inputPath, startTime, endTime }) => {
    return xttsManager.extractAudioClip(inputPath, startTime, endTime)
  })

  ipcMain.handle('xtts:selectMediaFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Media Files', extensions: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'mp3', 'wav', 'ogg', 'flac', 'm4a'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false }
    }

    const filePath = result.filePaths[0]
    const duration = await xttsManager.getMediaDuration(filePath)

    return {
      success: true,
      path: filePath,
      duration: duration.success ? duration.duration : undefined,
      error: duration.error
    }
  })
}
