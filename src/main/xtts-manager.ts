import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { exec, spawn, ChildProcess } from 'child_process'
import { promisify } from 'util'
import { isWindows } from './platform'

const execAsync = promisify(exec)
import * as https from 'https'

// Directory structure
const depsDir = path.join(app.getPath('userData'), 'deps')
const xttsDir = path.join(depsDir, 'xtts')
const xttsVoicesDir = path.join(xttsDir, 'voices')
const xttsVenvDir = path.join(xttsDir, 'venv')
const xttsPythonDir = path.join(xttsDir, 'python')
const xttsScriptPath = path.join(xttsDir, 'xtts_helper.py')

// Standalone Python download URL (python-build-standalone)
const STANDALONE_PYTHON_VERSION = '3.12.12'
const STANDALONE_PYTHON_TAG = '20251217'
const STANDALONE_PYTHON_URL = isWindows
  ? `https://github.com/astral-sh/python-build-standalone/releases/download/${STANDALONE_PYTHON_TAG}/cpython-${STANDALONE_PYTHON_VERSION}+${STANDALONE_PYTHON_TAG}-x86_64-pc-windows-msvc-install_only.tar.gz`
  : `https://github.com/astral-sh/python-build-standalone/releases/download/${STANDALONE_PYTHON_TAG}/cpython-${STANDALONE_PYTHON_VERSION}+${STANDALONE_PYTHON_TAG}-x86_64-unknown-linux-gnu-install_only.tar.gz`

// Get standalone Python path
function getStandalonePython(): string {
  return isWindows
    ? path.join(xttsPythonDir, 'python', 'python.exe')
    : path.join(xttsPythonDir, 'python', 'bin', 'python3')
}

// Get venv Python path
function getVenvPython(): string {
  return isWindows
    ? path.join(xttsVenvDir, 'Scripts', 'python.exe')
    : path.join(xttsVenvDir, 'bin', 'python')
}

function getVenvPip(): string {
  return isWindows
    ? path.join(xttsVenvDir, 'Scripts', 'pip.exe')
    : path.join(xttsVenvDir, 'bin', 'pip')
}

// Hugging Face XTTS-v2 sample voices
const XTTS_HF_BASE = 'https://huggingface.co/coqui/XTTS-v2/resolve/main/samples'

export const XTTS_SAMPLE_VOICES = [
  { id: 'xtts-en-sample', name: 'English Sample', language: 'en', file: 'en_sample.wav' },
  { id: 'xtts-de-sample', name: 'German Sample', language: 'de', file: 'de_sample.wav' },
  { id: 'xtts-es-sample', name: 'Spanish Sample', language: 'es', file: 'es_sample.wav' },
  { id: 'xtts-fr-sample', name: 'French Sample', language: 'fr', file: 'fr_sample.wav' },
  { id: 'xtts-ja-sample', name: 'Japanese Sample', language: 'ja', file: 'ja-sample.wav' },
  { id: 'xtts-pt-sample', name: 'Portuguese Sample', language: 'pt', file: 'pt_sample.wav' },
  { id: 'xtts-tr-sample', name: 'Turkish Sample', language: 'tr', file: 'tr_sample.wav' },
  { id: 'xtts-zh-sample', name: 'Chinese Sample', language: 'zh-cn', file: 'zh-cn-sample.wav' }
] as const

// XTTS supported languages
export const XTTS_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'ru', name: 'Russian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'cs', name: 'Czech' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh-cn', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'ko', name: 'Korean' },
  { code: 'hi', name: 'Hindi' }
] as const

export type XTTSLanguage = typeof XTTS_LANGUAGES[number]['code']

export interface XTTSVoice {
  id: string
  name: string
  language: XTTSLanguage
  referencePath: string
  createdAt: number
}

export interface XTTSStatus {
  installed: boolean
  pythonPath: string | null
  modelDownloaded: boolean
  error?: string
}

// Ensure directories exist
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Python helper script content - runs as a persistent server to keep model loaded
const XTTS_HELPER_SCRIPT = `#!/usr/bin/env python3
"""XTTS-v2 helper script for Claude Terminal - Server Mode"""
import sys
import json
import os

# Global TTS instance to keep model loaded
_tts = None
_device = None

def check_installation():
    """Check if TTS library is installed"""
    try:
        import torch
        from TTS.api import TTS
        return {"installed": True, "torch_version": torch.__version__}
    except ImportError as e:
        return {"installed": False, "error": str(e)}

def get_tts():
    """Get or create TTS instance (loads model once)"""
    global _tts, _device
    if _tts is None:
        import torch
        from TTS.api import TTS

        # Check if user wants to force CPU mode
        force_cpu = os.environ.get("XTTS_FORCE_CPU", "").lower() in ("1", "true", "yes")

        # Try CUDA first, fall back to CPU if OOM or other CUDA errors
        if not force_cpu and torch.cuda.is_available():
            try:
                _device = "cuda"
                _tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(_device)
            except (torch.cuda.OutOfMemoryError, RuntimeError) as e:
                # CUDA failed, fall back to CPU
                if _tts is not None:
                    del _tts
                torch.cuda.empty_cache()
                _device = "cpu"
                _tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(_device)
        else:
            _device = "cpu"
            _tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(_device)
    return _tts, _device

def speak(text, reference_audio, language, output_path, temperature=0.65, speed=1.0, top_k=50, top_p=0.85, repetition_penalty=2.0):
    """Generate speech using XTTS-v2 voice cloning"""
    try:
        tts, device = get_tts()
        # Build kwargs, only including supported parameters
        # Some TTS versions don't support all parameters
        kwargs = {
            "text": text,
            "speaker_wav": reference_audio,
            "language": language,
            "file_path": output_path,
        }
        # Try with all parameters first, fall back to basic call if it fails
        try:
            tts.tts_to_file(
                **kwargs,
                temperature=float(temperature),
                speed=float(speed),
                top_k=int(top_k),
                top_p=float(top_p),
                repetition_penalty=float(repetition_penalty)
            )
        except (TypeError, ValueError) as param_error:
            # Some parameters might not be supported, try without them
            sys.stderr.write(f"Parameter error, trying basic call: {param_error}\\n")
            sys.stderr.flush()
            tts.tts_to_file(**kwargs)
        return {"success": True, "path": output_path, "device": device}
    except Exception as e:
        return {"success": False, "error": str(e)}

def run_server():
    """Run as a server, reading JSON commands from stdin"""
    sys.stdout.write(json.dumps({"status": "ready"}) + "\\n")
    sys.stdout.flush()

    for line in sys.stdin:
        try:
            cmd = json.loads(line.strip())
            action = cmd.get("action")

            if action == "speak":
                result = speak(
                    cmd.get("text", ""),
                    cmd.get("reference_audio", ""),
                    cmd.get("language", "en"),
                    cmd.get("output_path", ""),
                    temperature=cmd.get("temperature", 0.65),
                    speed=cmd.get("speed", 1.0),
                    top_k=cmd.get("top_k", 50),
                    top_p=cmd.get("top_p", 0.85),
                    repetition_penalty=cmd.get("repetition_penalty", 2.0)
                )
            elif action == "check":
                result = check_installation()
            elif action == "ping":
                result = {"status": "alive"}
            elif action == "quit":
                result = {"status": "goodbye"}
                sys.stdout.write(json.dumps(result) + "\\n")
                sys.stdout.flush()
                break
            else:
                result = {"error": f"Unknown action: {action}"}

            sys.stdout.write(json.dumps(result) + "\\n")
            sys.stdout.flush()
        except json.JSONDecodeError as e:
            sys.stdout.write(json.dumps({"error": f"Invalid JSON: {e}"}) + "\\n")
            sys.stdout.flush()
        except Exception as e:
            sys.stdout.write(json.dumps({"error": str(e)}) + "\\n")
            sys.stdout.flush()

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command specified"}))
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "check":
        result = check_installation()
        print(json.dumps(result))
    elif cmd == "server":
        run_server()
    elif cmd == "speak":
        # Legacy single-shot mode (for backwards compatibility)
        if len(sys.argv) < 6:
            result = {"error": "Usage: speak <text> <reference_audio> <language> <output_path>"}
        else:
            result = speak(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
        print(json.dumps(result))
    else:
        result = {"error": f"Unknown command: {cmd}"}
        print(json.dumps(result))

if __name__ == "__main__":
    main()
`

class XTTSManager {
  private pythonPath: string | null = null
  private speakingProcess: ChildProcess | null = null
  private serverProcess: ChildProcess | null = null
  private serverReady: boolean = false
  private serverStarting: Promise<boolean> | null = null
  private pendingRequests: Map<string, { resolve: (result: any) => void; reject: (err: Error) => void }> = new Map()
  private responseBuffer: string = ''

  constructor() {
    this.initPythonPath()
  }

  // Start the XTTS server process
  private async startServer(): Promise<boolean> {
    // If already starting, wait for it
    if (this.serverStarting) {
      return this.serverStarting
    }

    // If already running, return true
    if (this.serverProcess && this.serverReady) {
      return true
    }

    this.serverStarting = this._startServerInternal()
    const result = await this.serverStarting
    this.serverStarting = null
    return result
  }

  private async _startServerInternal(): Promise<boolean> {
    // Use venv Python if available
    const venvPython = getVenvPython()
    const pythonToUse = fs.existsSync(venvPython) ? venvPython : this.pythonPath

    if (!pythonToUse) {
      return false
    }

    this.ensureHelperScript()

    return new Promise((resolve) => {
      const proc = spawn(pythonToUse, [xttsScriptPath, 'server'])
      this.serverProcess = proc
      this.serverReady = false
      this.responseBuffer = ''

      proc.stdout.on('data', (data) => {
        this.responseBuffer += data.toString()

        // Process complete lines
        const lines = this.responseBuffer.split('\n')
        this.responseBuffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue

          try {
            const response = JSON.parse(line)

            // Check for server ready message
            if (response.status === 'ready') {
              this.serverReady = true
              resolve(true)
              continue
            }

            // Handle response to pending request
            // Since we process requests sequentially, take the oldest one
            const [requestId, handlers] = this.pendingRequests.entries().next().value || []
            if (requestId && handlers) {
              this.pendingRequests.delete(requestId)
              handlers.resolve(response)
            }
          } catch (e) {
            console.error('XTTS server parse error:', e, 'line:', line)
          }
        }
      })

      proc.stderr.on('data', (data) => {
        // Log stderr but don't treat as error (PyTorch often writes info to stderr)
        console.log('XTTS server:', data.toString())
      })

      proc.on('close', (code) => {
        this.serverProcess = null
        this.serverReady = false

        // Reject any pending requests
        for (const [, handlers] of this.pendingRequests) {
          handlers.reject(new Error(`Server exited with code ${code}`))
        }
        this.pendingRequests.clear()

        // If we were waiting for ready, resolve false
        if (!this.serverReady) {
          resolve(false)
        }
      })

      proc.on('error', (err) => {
        this.serverProcess = null
        this.serverReady = false
        resolve(false)
      })

      // Timeout for server startup (model loading can take a while)
      setTimeout(() => {
        if (!this.serverReady) {
          console.error('XTTS server startup timeout')
          this.stopServer()
          resolve(false)
        }
      }, 120000) // 2 minute timeout for model loading
    })
  }

  private stopServer(): void {
    if (this.serverProcess) {
      // Try graceful shutdown first
      try {
        this.serverProcess.stdin?.write(JSON.stringify({ action: 'quit' }) + '\n')
      } catch {
        // Ignore write errors
      }

      // Force kill after short delay
      setTimeout(() => {
        if (this.serverProcess) {
          this.serverProcess.kill()
          this.serverProcess = null
        }
      }, 1000)
    }
    this.serverReady = false
  }

  private async sendServerCommand(command: object): Promise<any> {
    if (!this.serverProcess || !this.serverReady) {
      const started = await this.startServer()
      if (!started) {
        throw new Error('Failed to start XTTS server')
      }
    }

    return new Promise((resolve, reject) => {
      const requestId = `${Date.now()}-${Math.random()}`
      this.pendingRequests.set(requestId, { resolve, reject })

      try {
        this.serverProcess!.stdin?.write(JSON.stringify(command) + '\n')
      } catch (err: any) {
        this.pendingRequests.delete(requestId)
        reject(err)
      }

      // Timeout for individual requests
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId)
          reject(new Error('Request timeout'))
        }
      }, 300000) // 5 minute timeout for TTS generation
    })
  }

  private async initPythonPath(): Promise<void> {
    // Try to find Python 3.10-3.12 (required for coqui-tts)
    // Prefer specific versions first, then fall back to generic python3
    const pythonCommands = isWindows
      ? ['python3.12', 'python3.11', 'python3.10', 'python', 'python3', 'py']
      : ['python3.12', 'python3.11', 'python3.10', 'python3', 'python']

    for (const cmd of pythonCommands) {
      try {
        const { stdout } = await execAsync(`${cmd} --version`)
        const match = stdout.match(/Python 3\.(\d+)/)
        if (match) {
          const minorVersion = parseInt(match[1], 10)
          // coqui-tts requires Python 3.10-3.12
          if (minorVersion >= 10 && minorVersion <= 12) {
            this.pythonPath = cmd
            break
          }
        }
      } catch {
        // Try next
      }
    }

    // If no compatible version found, try to at least find any Python 3 for error reporting
    if (!this.pythonPath) {
      for (const cmd of ['python3', 'python']) {
        try {
          const { stdout } = await execAsync(`${cmd} --version`)
          if (stdout.includes('Python 3')) {
            this.pythonPath = cmd
            break
          }
        } catch {
          // Try next
        }
      }
    }
  }

  private async getPythonVersion(): Promise<string | null> {
    if (!this.pythonPath) return null
    try {
      const { stdout } = await execAsync(`${this.pythonPath} --version`)
      const match = stdout.match(/Python (3\.\d+\.\d+)/)
      return match ? match[1] : null
    } catch {
      return null
    }
  }

  private ensureHelperScript(): void {
    ensureDir(xttsDir)
    // Always write the script to ensure we have the latest version (server mode)
    fs.writeFileSync(xttsScriptPath, XTTS_HELPER_SCRIPT)
    if (!isWindows) {
      fs.chmodSync(xttsScriptPath, 0o755)
    }
  }

  async checkInstallation(): Promise<XTTSStatus> {
    // First check if venv exists and has TTS installed
    const venvPython = getVenvPython()
    if (fs.existsSync(venvPython)) {
      this.ensureHelperScript()
      try {
        const { stdout } = await execAsync(`"${venvPython}" "${xttsScriptPath}" check`, {
          timeout: 30000
        })
        const result = JSON.parse(stdout.trim())
        return {
          installed: result.installed,
          pythonPath: venvPython,
          modelDownloaded: false,
          error: result.error
        }
      } catch (e: any) {
        return {
          installed: false,
          pythonPath: venvPython,
          modelDownloaded: false,
          error: e.message
        }
      }
    }

    // Venv doesn't exist, check if system Python is available
    if (!this.pythonPath) {
      await this.initPythonPath()
    }

    if (!this.pythonPath) {
      return {
        installed: false,
        pythonPath: null,
        modelDownloaded: false,
        error: 'Python 3 not found. Please install Python 3.8+ to use XTTS.'
      }
    }

    return {
      installed: false,
      pythonPath: this.pythonPath,
      modelDownloaded: false,
      error: "No module named 'TTS'"
    }
  }

  private async downloadStandalonePython(onProgress?: (status: string, percent?: number) => void): Promise<{ success: boolean; error?: string }> {
    const standalonePython = getStandalonePython()
    if (fs.existsSync(standalonePython)) {
      return { success: true }
    }

    onProgress?.('Downloading Python 3.12...', 0)
    ensureDir(xttsPythonDir)

    const tarPath = path.join(xttsPythonDir, 'python.tar.gz')

    try {
      // Download the tarball
      await new Promise<void>((resolve, reject) => {
        const downloadWithRedirect = (url: string) => {
          https.get(url, (response) => {
            if (response.statusCode && [301, 302, 307, 308].includes(response.statusCode)) {
              const location = response.headers.location
              if (!location) {
                reject(new Error('Redirect with no location'))
                return
              }
              downloadWithRedirect(location)
              return
            }

            if (response.statusCode !== 200) {
              reject(new Error(`Download failed: HTTP ${response.statusCode}`))
              return
            }

            const file = fs.createWriteStream(tarPath)
            const total = parseInt(response.headers['content-length'] || '0', 10)
            let downloaded = 0

            response.on('data', (chunk) => {
              downloaded += chunk.length
              if (total > 0) {
                const pct = Math.round((downloaded / total) * 30) // 0-30%
                onProgress?.(`Downloading Python 3.12 (${Math.round(downloaded / 1024 / 1024)}MB)...`, pct)
              }
            })

            response.pipe(file)
            file.on('finish', () => {
              file.close()
              resolve()
            })
            file.on('error', (err) => {
              file.close()
              fs.unlinkSync(tarPath)
              reject(err)
            })
          }).on('error', reject)
        }

        downloadWithRedirect(STANDALONE_PYTHON_URL)
      })

      // Extract the tarball
      onProgress?.('Extracting Python 3.12...', 35)
      await execAsync(`tar -xzf "${tarPath}" -C "${xttsPythonDir}"`, { timeout: 120000 })

      // Cleanup
      fs.unlinkSync(tarPath)

      if (!fs.existsSync(standalonePython)) {
        return { success: false, error: 'Python extraction failed' }
      }

      return { success: true }
    } catch (e: any) {
      if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath)
      return { success: false, error: e.message }
    }
  }

  async install(onProgress?: (status: string, percent?: number) => void): Promise<{ success: boolean; error?: string }> {
    try {
      ensureDir(xttsDir)

      // First, ensure we have a compatible Python (download standalone if needed)
      const standalonePython = getStandalonePython()
      let pythonToUse: string

      if (fs.existsSync(standalonePython)) {
        pythonToUse = standalonePython
      } else {
        // Check if system has compatible Python
        if (!this.pythonPath) {
          await this.initPythonPath()
        }

        const version = await this.getPythonVersion()
        const hasCompatiblePython = version && /3\.(10|11|12)\./.test(version)

        if (!hasCompatiblePython) {
          // Download standalone Python
          const downloadResult = await this.downloadStandalonePython(onProgress)
          if (!downloadResult.success) {
            return { success: false, error: downloadResult.error || 'Failed to download Python' }
          }
          pythonToUse = standalonePython
        } else {
          pythonToUse = this.pythonPath!
        }
      }

      // Create virtual environment
      onProgress?.('Creating virtual environment...', 40)
      const venvPython = getVenvPython()

      if (!fs.existsSync(venvPython)) {
        await execAsync(`"${pythonToUse}" -m venv "${xttsVenvDir}"`, { timeout: 120000 })
      }

      if (!fs.existsSync(venvPython)) {
        return { success: false, error: 'Failed to create virtual environment' }
      }

      // Upgrade pip in venv
      onProgress?.('Upgrading pip...', 50)
      await execAsync(`"${venvPython}" -m pip install --upgrade pip`, { timeout: 120000 })

      // Install coqui-tts (the maintained fork that supports Python 3.12)
      onProgress?.('Installing TTS library (this may take several minutes)...', 55)
      await execAsync(`"${venvPython}" -m pip install coqui-tts`, {
        timeout: 900000  // 15 minutes - it's a large package with many dependencies
      })

      // Install torchcodec (required for audio loading in newer TTS versions)
      onProgress?.('Installing audio codec...', 90)
      await execAsync(`"${venvPython}" -m pip install torchcodec`, { timeout: 120000 })
      onProgress?.('TTS library installed', 95)

      // Verify installation
      const status = await this.checkInstallation()
      if (!status.installed) {
        return { success: false, error: status.error || 'Installation verification failed' }
      }

      onProgress?.('Installation complete', 100)
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  }

  async createVoice(
    audioPath: string,
    name: string,
    language: XTTSLanguage
  ): Promise<{ success: boolean; voiceId?: string; error?: string }> {
    try {
      // Validate audio file exists
      if (!fs.existsSync(audioPath)) {
        return { success: false, error: 'Audio file not found' }
      }

      // Create voice directory
      const voiceId = name.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const voiceDir = path.join(xttsVoicesDir, voiceId)
      ensureDir(voiceDir)

      // Copy reference audio
      const referencePath = path.join(voiceDir, 'reference.wav')
      fs.copyFileSync(audioPath, referencePath)

      // Save metadata
      const metadata: XTTSVoice = {
        id: voiceId,
        name,
        language,
        referencePath,
        createdAt: Date.now()
      }
      fs.writeFileSync(
        path.join(voiceDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      )

      return { success: true, voiceId }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  }

  getVoices(): XTTSVoice[] {
    const voices: XTTSVoice[] = []

    if (!fs.existsSync(xttsVoicesDir)) {
      return voices
    }

    const dirs = fs.readdirSync(xttsVoicesDir, { withFileTypes: true })
      .filter(d => d.isDirectory())

    for (const dir of dirs) {
      const metadataPath = path.join(xttsVoicesDir, dir.name, 'metadata.json')
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
          voices.push(metadata)
        } catch {
          // Skip invalid metadata
        }
      }
    }

    return voices.sort((a, b) => b.createdAt - a.createdAt)
  }

  getVoice(voiceId: string): XTTSVoice | null {
    const metadataPath = path.join(xttsVoicesDir, voiceId, 'metadata.json')
    if (fs.existsSync(metadataPath)) {
      try {
        return JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
      } catch {
        return null
      }
    }
    return null
  }

  deleteVoice(voiceId: string): { success: boolean; error?: string } {
    try {
      const voiceDir = path.join(xttsVoicesDir, voiceId)
      if (fs.existsSync(voiceDir)) {
        fs.rmSync(voiceDir, { recursive: true })
      }
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  }

  async speak(
    text: string,
    voiceId: string,
    language?: XTTSLanguage,
    options?: {
      temperature?: number
      speed?: number
      topK?: number
      topP?: number
      repetitionPenalty?: number
    }
  ): Promise<{ success: boolean; audioData?: string; error?: string }> {
    const voice = this.getVoice(voiceId)
    if (!voice) {
      return { success: false, error: 'Voice not found' }
    }

    try {
      const tempDir = app.getPath('temp')
      const outputPath = path.join(tempDir, `xtts_${Date.now()}.wav`)
      const lang = language || voice.language

      // Use persistent server for TTS (keeps model loaded in memory)
      const result = await this.sendServerCommand({
        action: 'speak',
        text,
        reference_audio: voice.referencePath,
        language: lang,
        output_path: outputPath,
        temperature: options?.temperature ?? 0.65,
        speed: options?.speed ?? 1.0,
        top_k: options?.topK ?? 50,
        top_p: options?.topP ?? 0.85,
        repetition_penalty: options?.repetitionPenalty ?? 2.0
      })

      if (result.success && fs.existsSync(outputPath)) {
        const audioBuffer = fs.readFileSync(outputPath)
        const audioData = audioBuffer.toString('base64')
        fs.unlinkSync(outputPath)
        return { success: true, audioData }
      } else {
        return { success: false, error: result.error || 'TTS generation failed' }
      }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  }

  stopSpeaking(): void {
    // Stop the server (which stops any in-progress generation)
    this.stopServer()
  }

  getVoicesDir(): string {
    return xttsVoicesDir
  }

  // Get available sample voices from Hugging Face
  getSampleVoices(): typeof XTTS_SAMPLE_VOICES {
    return XTTS_SAMPLE_VOICES
  }

  // Download a sample voice from Hugging Face
  async downloadSampleVoice(
    sampleId: string,
    onProgress?: (status: string, percent?: number) => void
  ): Promise<{ success: boolean; voiceId?: string; error?: string }> {
    const sample = XTTS_SAMPLE_VOICES.find(s => s.id === sampleId)
    if (!sample) {
      return { success: false, error: `Sample voice "${sampleId}" not found` }
    }

    try {
      ensureDir(xttsVoicesDir)

      const voiceDir = path.join(xttsVoicesDir, sample.id)
      ensureDir(voiceDir)

      const referencePath = path.join(voiceDir, 'reference.wav')
      const url = `${XTTS_HF_BASE}/${sample.file}`

      onProgress?.(`Downloading ${sample.name}...`, 0)

      await new Promise<void>((resolve, reject) => {
        const file = fs.createWriteStream(referencePath)

        const request = https.get(url, (response) => {
          // Handle redirects
          if (response.statusCode && [301, 302, 307, 308].includes(response.statusCode)) {
            file.close()
            if (fs.existsSync(referencePath)) fs.unlinkSync(referencePath)
            const location = response.headers.location
            if (!location) {
              reject(new Error('Redirect with no location header'))
              return
            }
            const redirectUrl = location.startsWith('http') ? location : new URL(location, url).toString()

            // Follow redirect
            const redirectReq = https.get(redirectUrl, (redirectRes) => {
              if (redirectRes.statusCode !== 200) {
                file.close()
                reject(new Error(`Download failed with status ${redirectRes.statusCode}`))
                return
              }

              const file2 = fs.createWriteStream(referencePath)
              const total = parseInt(redirectRes.headers['content-length'] || '0', 10)
              let downloaded = 0

              redirectRes.on('data', (chunk) => {
                downloaded += chunk.length
                if (total > 0) {
                  onProgress?.(`Downloading ${sample.name}...`, Math.round((downloaded / total) * 100))
                }
              })

              redirectRes.pipe(file2)
              file2.on('finish', () => {
                file2.close()
                resolve()
              })
              file2.on('error', (err) => {
                file2.close()
                if (fs.existsSync(referencePath)) fs.unlinkSync(referencePath)
                reject(err)
              })
            })
            redirectReq.on('error', reject)
            return
          }

          if (response.statusCode !== 200) {
            file.close()
            reject(new Error(`Download failed with status ${response.statusCode}`))
            return
          }

          const total = parseInt(response.headers['content-length'] || '0', 10)
          let downloaded = 0

          response.on('data', (chunk) => {
            downloaded += chunk.length
            if (total > 0) {
              onProgress?.(`Downloading ${sample.name}...`, Math.round((downloaded / total) * 100))
            }
          })

          response.pipe(file)
          file.on('finish', () => {
            file.close()
            resolve()
          })
          file.on('error', (err) => {
            file.close()
            if (fs.existsSync(referencePath)) fs.unlinkSync(referencePath)
            reject(err)
          })
        })

        request.on('error', (err) => {
          file.close()
          if (fs.existsSync(referencePath)) fs.unlinkSync(referencePath)
          reject(err)
        })
      })

      // Save metadata
      const metadata: XTTSVoice = {
        id: sample.id,
        name: sample.name,
        language: sample.language as XTTSLanguage,
        referencePath,
        createdAt: Date.now()
      }
      fs.writeFileSync(
        path.join(voiceDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      )

      onProgress?.('Voice downloaded successfully', 100)
      return { success: true, voiceId: sample.id }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  }

  // Check if a sample voice is installed
  isSampleVoiceInstalled(sampleId: string): boolean {
    const voiceDir = path.join(xttsVoicesDir, sampleId)
    return fs.existsSync(path.join(voiceDir, 'metadata.json'))
  }

  // ==================== AUDIO PROCESSING ====================

  // Get audio/video duration using ffprobe
  async getMediaDuration(filePath: string): Promise<{ success: boolean; duration?: number; error?: string }> {
    try {
      const { stdout } = await execAsync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
        { timeout: 30000 }
      )
      const duration = parseFloat(stdout.trim())
      if (isNaN(duration)) {
        return { success: false, error: 'Could not determine duration' }
      }
      return { success: true, duration }
    } catch (e: any) {
      // Check if ffmpeg/ffprobe is installed
      if (e.message.includes('not found') || e.message.includes('ENOENT')) {
        return { success: false, error: 'ffmpeg not found. Please install ffmpeg to use this feature.' }
      }
      return { success: false, error: e.message }
    }
  }

  // Extract audio clip from video/audio file
  async extractAudioClip(
    inputPath: string,
    startTime: number,
    endTime: number,
    outputPath?: string
  ): Promise<{ success: boolean; outputPath?: string; dataUrl?: string; error?: string }> {
    try {
      const duration = endTime - startTime
      if (duration <= 0) {
        return { success: false, error: 'End time must be greater than start time' }
      }
      if (duration < 3) {
        return { success: false, error: 'Clip must be at least 3 seconds long' }
      }
      if (duration > 30) {
        return { success: false, error: 'Clip should be 30 seconds or less for best results' }
      }

      // Generate output path if not provided
      const outPath = outputPath || path.join(app.getPath('temp'), `xtts_clip_${Date.now()}.wav`)

      // Extract audio with ffmpeg
      // -y: overwrite output
      // -ss: start time
      // -t: duration
      // -vn: no video
      // -acodec pcm_s16le: WAV format
      // -ar 22050: sample rate (XTTS expects this)
      // -ac 1: mono
      await execAsync(
        `ffmpeg -y -ss ${startTime} -t ${duration} -i "${inputPath}" -vn -acodec pcm_s16le -ar 22050 -ac 1 "${outPath}"`,
        { timeout: 60000 }
      )

      if (!fs.existsSync(outPath)) {
        return { success: false, error: 'Failed to extract audio' }
      }

      // Read file and convert to base64 data URL for renderer
      const audioData = fs.readFileSync(outPath)
      const dataUrl = `data:audio/wav;base64,${audioData.toString('base64')}`

      return { success: true, outputPath: outPath, dataUrl }
    } catch (e: any) {
      if (e.message.includes('not found') || e.message.includes('ENOENT')) {
        return { success: false, error: 'ffmpeg not found. Please install ffmpeg to use this feature.' }
      }
      return { success: false, error: e.message }
    }
  }

  // Get temp directory for audio clips
  getTempDir(): string {
    return app.getPath('temp')
  }
}

// Export singleton instance
export const xttsManager = new XTTSManager()
