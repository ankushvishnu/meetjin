"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanExpress = scanExpress;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const HTTP_METHOD_PATTERNS = [
    // app.get / router.get / server.get / router.post etc.
    /\b(?:app|router|server)\.(get|post|put|patch|delete|all)\s*\(\s*['"`']([^'"`]+)['"`]/gi,
    // router.route('/path').get(...)
    /\b(?:app|router|server)\.route\s*\(\s*['"`']([^'"`]+)['"`]\s*\)\s*\.\s*(get|post|put|patch|delete|all)/gi,
    // fastify/server.route({ method: 'GET', url: '/path' })
    /\b(?:server|app|fastify)\.route\s*\(\s*\{[^}]*method\s*:\s*['"`]?(GET|POST|PUT|PATCH|DELETE|ALL)['"`]?,[^}]*url\s*:\s*['"`]([^'"`]+)['"`]/gi,
    /\b(?:server|app|fastify)\.route\s*\(\s*\{[^}]*url\s*:\s*['"`]([^'"`]+)['"`],[^}]*method\s*:\s*['"`]?(GET|POST|PUT|PATCH|DELETE|ALL)['"`]?/gi,
];
/**
 * Express / Koa / Fastify-style scanner.
 * Scans .ts/.js files for route definitions like app.get('/path', ...)
 */
async function scanExpress(cwd) {
    const intents = [];
    // Common source directories
    const srcDirs = ['src', 'routes', 'api', 'controllers', 'lib', '.'];
    const scannedFiles = new Set();
    for (const dir of srcDirs) {
        const fullDir = path_1.default.join(cwd, dir);
        if (!fs_1.default.existsSync(fullDir))
            continue;
        scanDir(fullDir, scannedFiles, intents);
    }
    return intents;
}
function scanDir(dir, scannedFiles, intents) {
    let entries;
    try {
        entries = fs_1.default.readdirSync(dir);
    }
    catch {
        return;
    }
    for (const entry of entries) {
        const fullPath = path_1.default.join(dir, entry);
        // Skip node_modules, dist, .git
        if (entry === 'node_modules' || entry === 'dist' || entry === '.git' || entry === '.next')
            continue;
        let stat;
        try {
            stat = fs_1.default.statSync(fullPath);
        }
        catch {
            continue;
        }
        if (stat.isDirectory()) {
            scanDir(fullPath, scannedFiles, intents);
        }
        else if (/\.(ts|js|mjs|cjs)$/.test(entry) && !entry.endsWith('.d.ts')) {
            if (scannedFiles.has(fullPath))
                continue;
            scannedFiles.add(fullPath);
            scanFile(fullPath, intents);
        }
    }
}
function scanFile(filePath, intents) {
    let content;
    try {
        content = fs_1.default.readFileSync(filePath, 'utf-8');
    }
    catch {
        return;
    }
    for (const pattern of HTTP_METHOD_PATTERNS) {
        // Reset lastIndex for global regex
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            let method = match[1].toUpperCase();
            let endpoint = match[2];
            // if pattern matched router.route('/path').get, swap groups
            if (endpoint.startsWith('/')) {
                // common case: method is group1 and endpoint is group2
            }
            else if (method.startsWith('/')) {
                endpoint = method;
                method = match[2].toUpperCase();
            }
            if (method === 'ALL') {
                method = 'GET';
            }
            // Skip middleware-like patterns (no leading /)
            if (!endpoint.startsWith('/'))
                continue;
            // Skip static file serving
            if (endpoint.includes('.') && !endpoint.includes(':'))
                continue;
            const id = `${method.toLowerCase()}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}`;
            // Avoid duplicates
            if (intents.some(i => i.id === id))
                continue;
            // Convert Express :param to description
            const params = endpoint.match(/:(\w+)/g);
            const paramDesc = params
                ? ` (params: ${params.map(p => p.slice(1)).join(', ')})`
                : '';
            intents.push({
                id,
                name: `${method} ${endpoint}`,
                description: `Auto-detected Express route: ${method} ${endpoint}${paramDesc}`,
                triggers: [
                    `call ${endpoint}`,
                    `${method.toLowerCase()} ${endpoint}`,
                ],
                category: 'developer',
                method: method,
                endpoint,
                requires_auth: false,
                destructive: method === 'DELETE',
                confirmation_required: method === 'DELETE',
            });
        }
    }
}
