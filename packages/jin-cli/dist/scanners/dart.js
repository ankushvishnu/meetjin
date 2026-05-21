"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanDart = scanDart;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Dart / Flutter scanner.
 * Scans .dart files for route definitions.
 * Since Flutter is primarily a client-side framework, it looks for
 * navigation routes or API client endpoints.
 */
async function scanDart(cwd) {
    const intents = [];
    // Common Dart source directories
    const srcDirs = ['lib', 'packages'];
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
        else if (entry.endsWith('.dart')) {
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
    // Look for common route patterns in Flutter/Dart
    // 1. Named routes: '/settings'
    // 2. API endpoints in clients: get('/users')
    const ROUTE_PATTERNS = [
        /['"](\/[a-zA-Z0-9\/\-_:]+)['"]/g, // Generic path strings
        /\.get\s*\(\s*['"](\/[^'"]+)['"]/gi, // .get('/path')
        /\.post\s*\(\s*['"](\/[^'"]+)['"]/gi, // .post('/path')
        /\.put\s*\(\s*['"](\/[^'"]+)['"]/gi, // .put('/path')
        /\.delete\s*\(\s*['"](\/[^'"]+)['"]/gi, // .delete('/path')
    ];
    for (const pattern of ROUTE_PATTERNS) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const endpoint = match[1];
            // Basic validation to avoid random strings
            if (endpoint.length < 2 || endpoint.length > 100)
                continue;
            if (endpoint.includes(' ') || endpoint.includes('@'))
                continue;
            // Determine method
            let method = 'GET';
            if (pattern.source.includes('.post'))
                method = 'POST';
            else if (pattern.source.includes('.put'))
                method = 'PUT';
            else if (pattern.source.includes('.delete'))
                method = 'DELETE';
            const id = `${method.toLowerCase()}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}`;
            if (intents.some(i => i.id === id))
                continue;
            intents.push({
                id,
                name: `${method} ${endpoint}`,
                description: `Auto-detected Dart/Flutter route: ${endpoint}`,
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
