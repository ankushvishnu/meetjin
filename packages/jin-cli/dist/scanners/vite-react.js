"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanViteReact = scanViteReact;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ROUTE_PATTERNS = [
    // <Route path="/something"
    /<Route[^>]*path\s*=\s*['"](\/[^'"]+)['"]/gi,
    // { path: "/something" } (createBrowserRouter)
    /path\s*:\s*['"](\/[^'"]+)['"]/gi
];
/**
 * Vite + React SPA Scanner.
 * Scans src/ directory for typical react-router-dom route definitions
 * and extracts them as GET intents (since SPAs typically "load" these views).
 */
async function scanViteReact(cwd) {
    const intents = [];
    const srcDir = path_1.default.join(cwd, 'src');
    if (!fs_1.default.existsSync(srcDir))
        return intents;
    const scannedFiles = new Set();
    scanDir(srcDir, scannedFiles, intents);
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
        else if (/\.(tsx|jsx|ts|js)$/.test(entry) && !entry.endsWith('.d.ts')) {
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
    // Only scan files that likely contain routing
    if (!content.includes('Route') && !content.includes('path') && !content.includes('react-router'))
        return;
    for (const pattern of ROUTE_PATTERNS) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const endpoint = match[1];
            // Skip root or catch-all routes which are too generic
            if (endpoint === '/' || endpoint === '*' || endpoint.includes('*'))
                continue;
            const id = `get_${endpoint.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}`;
            // Avoid duplicates
            if (intents.some(i => i.id === id))
                continue;
            // Convert :param to description
            const params = endpoint.match(/:(\w+)/g);
            const paramDesc = params
                ? ` (params: ${params.map(p => p.slice(1)).join(', ')})`
                : '';
            intents.push({
                id,
                name: `View ${endpoint}`,
                description: `React SPA route: ${endpoint}${paramDesc}`,
                triggers: [
                    `open ${endpoint.replace(/^\//, '').replace(/:/g, '')} page`,
                    `view ${endpoint}`,
                ],
                category: 'developer',
                method: 'GET',
                endpoint,
                requires_auth: false,
                destructive: false,
                confirmation_required: false,
            });
        }
    }
}
