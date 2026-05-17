import fs from 'fs'
import path from 'path'
import { AIPIntent } from '../types/aip'

const HTTP_METHOD_PATTERNS = [
  // app.get / router.get / app.post etc.
  /\b(?:app|router|server)\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
]

/**
 * Express / Koa / Fastify-style scanner.
 * Scans .ts/.js files for route definitions like app.get('/path', ...) 
 */
export async function scanExpress(cwd: string): Promise<Partial<AIPIntent>[]> {
  const intents: Partial<AIPIntent>[] = []

  // Common source directories
  const srcDirs = ['src', 'routes', 'api', 'controllers', 'lib', '.']
  const scannedFiles = new Set<string>()

  for (const dir of srcDirs) {
    const fullDir = path.join(cwd, dir)
    if (!fs.existsSync(fullDir)) continue
    scanDir(fullDir, scannedFiles, intents)
  }

  return intents
}

function scanDir(dir: string, scannedFiles: Set<string>, intents: Partial<AIPIntent>[]) {
  let entries: string[]
  try {
    entries = fs.readdirSync(dir)
  } catch {
    return
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    
    // Skip node_modules, dist, .git
    if (entry === 'node_modules' || entry === 'dist' || entry === '.git' || entry === '.next') continue

    let stat: fs.Stats
    try {
      stat = fs.statSync(fullPath)
    } catch {
      continue
    }

    if (stat.isDirectory()) {
      scanDir(fullPath, scannedFiles, intents)
    } else if (/\.(ts|js|mjs|cjs)$/.test(entry) && !entry.endsWith('.d.ts')) {
      if (scannedFiles.has(fullPath)) continue
      scannedFiles.add(fullPath)
      scanFile(fullPath, intents)
    }
  }
}

function scanFile(filePath: string, intents: Partial<AIPIntent>[]) {
  let content: string
  try {
    content = fs.readFileSync(filePath, 'utf-8')
  } catch {
    return
  }

  for (const pattern of HTTP_METHOD_PATTERNS) {
    // Reset lastIndex for global regex
    pattern.lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = pattern.exec(content)) !== null) {
      const method = match[1].toUpperCase()
      const endpoint = match[2]

      // Skip middleware-like patterns (no leading /)
      if (!endpoint.startsWith('/')) continue
      // Skip static file serving
      if (endpoint.includes('.') && !endpoint.includes(':')) continue

      const id = `${method.toLowerCase()}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}`

      // Avoid duplicates
      if (intents.some(i => i.id === id)) continue

      // Convert Express :param to description
      const params = endpoint.match(/:(\w+)/g)
      const paramDesc = params
        ? ` (params: ${params.map(p => p.slice(1)).join(', ')})`
        : ''

      intents.push({
        id,
        name: `${method} ${endpoint}`,
        description: `Auto-detected Express route: ${method} ${endpoint}${paramDesc}`,
        triggers: [
          `call ${endpoint}`,
          `${method.toLowerCase()} ${endpoint}`,
        ],
        category: 'developer',
        method: method as any,
        endpoint,
        requires_auth: false,
        destructive: method === 'DELETE',
        confirmation_required: method === 'DELETE',
      })
    }
  }
}
