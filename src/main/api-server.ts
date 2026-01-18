import * as http from 'http'

interface ApiServer {
  server: http.Server
  port: number
  projectPath: string
}

export type SessionMode = 'existing' | 'new-keep' | 'new-close'

export interface PromptResult {
  success: boolean
  message?: string
  error?: string
  sessionCreated?: boolean
}

type PromptHandler = (projectPath: string, prompt: string, sessionMode: SessionMode) => Promise<PromptResult>

type SessionModeGetter = (projectPath: string) => SessionMode

// Rate limiting configuration
const RATE_LIMIT_MAX_REQUESTS = 10
const RATE_LIMIT_WINDOW_MS = 60000 // 1 minute

// Maximum allowed request body size (100KB) to prevent DoS attacks
const MAX_BODY_SIZE = 100 * 1024

interface RateLimitEntry {
  count: number
  windowStart: number
}

export class ApiServerManager {
  private servers: Map<string, ApiServer> = new Map() // projectPath -> server
  private promptHandler: PromptHandler | null = null
  private sessionModeGetter: SessionModeGetter | null = null
  private rateLimitMap: Map<string, RateLimitEntry> = new Map() // IP -> rate limit info

  setPromptHandler(handler: PromptHandler) {
    this.promptHandler = handler
  }

  setSessionModeGetter(getter: SessionModeGetter) {
    this.sessionModeGetter = getter
  }

  private checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const entry = this.rateLimitMap.get(ip)

    if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
      // Start a new window
      this.rateLimitMap.set(ip, { count: 1, windowStart: now })
      return true
    }

    if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
      return false // Rate limited
    }

    entry.count++
    return true
  }

  private cleanupRateLimitMap(): void {
    const now = Date.now()
    for (const [ip, entry] of this.rateLimitMap) {
      if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
        this.rateLimitMap.delete(ip)
      }
    }
  }

  start(projectPath: string, port: number): { success: boolean; error?: string } {
    // Validate port is a number and within valid range (excluding privileged ports)
    if (!Number.isInteger(port) || port < 1024 || port > 65535) {
      return { success: false, error: 'Invalid port: must be an integer between 1024 and 65535' }
    }

    // Stop existing server for this project if any
    this.stop(projectPath)

    // Check if port is already in use by another project
    for (const [path, server] of this.servers) {
      if (server.port === port && path !== projectPath) {
        return { success: false, error: `Port ${port} is already in use by another project` }
      }
    }

    try {
      const server = http.createServer((req, res) => {
        // No CORS headers needed - server binds to localhost only (127.0.0.1)
        // and is not intended to be accessed from web pages

        if (req.method === 'POST' && req.url === '/prompt') {
          // Rate limiting check
          const clientIp = req.socket.remoteAddress || 'unknown'
          if (!this.checkRateLimit(clientIp)) {
            res.writeHead(429, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
              success: false,
              error: 'Rate limit exceeded. Maximum 10 requests per minute.'
            }))
            return
          }

          // Periodically clean up stale rate limit entries
          if (Math.random() < 0.1) {
            this.cleanupRateLimitMap()
          }

          let body = ''
          let bodySizeExceeded = false
          req.on('data', chunk => {
            body += chunk
            // Check body size limit to prevent DoS attacks
            if (body.length > MAX_BODY_SIZE) {
              bodySizeExceeded = true
              res.writeHead(413, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: false, error: 'Request body too large' }))
              req.destroy()
            }
          })
          req.on('error', (e) => {
            console.error('Request error:', e)
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: 'Request error' }))
          })
          req.on('end', async () => {
            // Skip processing if body size limit was exceeded
            if (bodySizeExceeded) return
            try {
              const data = JSON.parse(body)
              const prompt = data.prompt || data.message || data.text || ''

              if (!prompt) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: false, error: 'No prompt provided' }))
                return
              }

              if (this.promptHandler) {
                // Get session mode from project settings or request body
                const requestedMode = data.sessionMode as SessionMode | undefined
                const sessionMode = requestedMode || this.sessionModeGetter?.(projectPath) || 'existing'

                try {
                  const result = await this.promptHandler(projectPath, prompt, sessionMode)
                  if (result.success) {
                    res.writeHead(200, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify(result))
                  } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify(result))
                  }
                } catch (handlerError: any) {
                  res.writeHead(500, { 'Content-Type': 'application/json' })
                  res.end(JSON.stringify({ success: false, error: handlerError.message || 'Handler error' }))
                }
              } else {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: false, error: 'No prompt handler configured' }))
              }
            } catch (e) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }))
            }
          })
        } else if (req.method === 'GET' && req.url === '/status') {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            success: true,
            project: projectPath,
            message: 'API server running'
          }))
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            success: false,
            error: 'Not found',
            endpoints: {
              'POST /prompt': 'Send a prompt to the terminal. Body: { "prompt": "your message" }',
              'GET /status': 'Check server status'
            }
          }))
        }
      })

      server.on('error', (e: NodeJS.ErrnoException) => {
        console.error(`API server error on port ${port}:`, e.message)
        this.servers.delete(projectPath)
      })

      server.listen(port, '127.0.0.1', () => {
        console.log(`API server started on port ${port} for project: ${projectPath}`)
      })

      this.servers.set(projectPath, { server, port, projectPath })
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  }

  stop(projectPath: string): void {
    const apiServer = this.servers.get(projectPath)
    if (apiServer) {
      apiServer.server.close()
      this.servers.delete(projectPath)
      console.log(`API server stopped for project: ${projectPath}`)
    }
  }

  stopAll(): void {
    for (const [projectPath] of this.servers) {
      this.stop(projectPath)
    }
  }

  isRunning(projectPath: string): boolean {
    return this.servers.has(projectPath)
  }

  getPort(projectPath: string): number | undefined {
    return this.servers.get(projectPath)?.port
  }
}
