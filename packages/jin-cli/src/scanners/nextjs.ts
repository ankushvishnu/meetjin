import fs from 'fs'
import path from 'path'
import { AIPIntent } from '../types/aip'

/**
 * Very basic Next.js App Router scanner.
 * Looks for route.ts files and extracts endpoints.
 */
export async function scanNextJS(cwd: string): Promise<Partial<AIPIntent>[]> {
  const intents: Partial<AIPIntent>[] = []
  
  const appDir = fs.existsSync(path.join(cwd, 'src/app')) 
    ? path.join(cwd, 'src/app')
    : fs.existsSync(path.join(cwd, 'app'))
      ? path.join(cwd, 'app')
      : null

  if (!appDir) return intents

  function walk(dir: string) {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        walk(fullPath)
      } else if (file === 'route.ts' || file === 'route.js') {
        // Found a route file
        const relativePath = path.relative(appDir!, dir)
        const endpoint = '/' + relativePath.replace(/\\/g, '/')
        
        // Read file to detect methods
        const content = fs.readFileSync(fullPath, 'utf-8')
        const methods: string[] = []
        
        if (content.includes('export async function GET')) methods.push('GET')
        if (content.includes('export async function POST')) methods.push('POST')
        if (content.includes('export async function PUT')) methods.push('PUT')
        if (content.includes('export async function DELETE')) methods.push('DELETE')
        if (content.includes('export async function PATCH')) methods.push('PATCH')
        
        for (const method of methods) {
          const id = `${method.toLowerCase()}_${relativePath.replace(/[^a-zA-Z0-9]/g, '_')}`
          intents.push({
            id,
            name: `${method} ${endpoint}`,
            description: `Auto-generated intent for ${method} ${endpoint}`,
            method: method as any,
            endpoint,
            triggers: [`call ${endpoint}`, `${method.toLowerCase()} ${endpoint}`],
            category: 'developer', // Default
            requires_auth: false,
            destructive: method === 'DELETE',
            confirmation_required: method === 'DELETE'
          })
        }
      }
    }
  }

  try {
    walk(appDir)
  } catch (e) {
    console.error('Error scanning Next.js directory:', e)
  }

  return intents
}
