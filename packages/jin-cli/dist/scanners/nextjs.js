"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanNextJS = scanNextJS;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const EXPORT_METHODS = [
    { regex: /export\s+async\s+function\s+GET/m, method: 'GET' },
    { regex: /export\s+async\s+function\s+POST/m, method: 'POST' },
    { regex: /export\s+async\s+function\s+PUT/m, method: 'PUT' },
    { regex: /export\s+async\s+function\s+DELETE/m, method: 'DELETE' },
    { regex: /export\s+async\s+function\s+PATCH/m, method: 'PATCH' },
];
const REQ_METHOD_PATTERNS = [
    /req\.method\s*===\s*['"](GET|POST|PUT|DELETE|PATCH)['"]/gi,
    /req\.method\s*!==\s*['"](GET|POST|PUT|DELETE|PATCH)['"]/gi,
    /switch\s*\(\s*req\.method\s*\)/gi,
    /case\s+['"](GET|POST|PUT|DELETE|PATCH)['"]\s*:/gi,
];
/**
 * Next.js App Router + Pages API scanner.
 * Scans app/route.ts files and pages/api files for route metadata.
 */
async function scanNextJS(cwd) {
    const intents = [];
    const appDir = fs_1.default.existsSync(path_1.default.join(cwd, 'src/app'))
        ? path_1.default.join(cwd, 'src/app')
        : fs_1.default.existsSync(path_1.default.join(cwd, 'app'))
            ? path_1.default.join(cwd, 'app')
            : null;
    const pagesApiDir = fs_1.default.existsSync(path_1.default.join(cwd, 'src/pages/api'))
        ? path_1.default.join(cwd, 'src/pages/api')
        : fs_1.default.existsSync(path_1.default.join(cwd, 'pages/api'))
            ? path_1.default.join(cwd, 'pages/api')
            : null;
    if (appDir) {
        scanAppRouter(appDir, intents);
    }
    if (pagesApiDir) {
        scanPagesApi(pagesApiDir, intents);
    }
    return intents;
}
function scanAppRouter(appDir, intents) {
    function walk(dir) {
        const files = fs_1.default.readdirSync(dir);
        for (const file of files) {
            const fullPath = path_1.default.join(dir, file);
            const stat = fs_1.default.statSync(fullPath);
            if (stat.isDirectory()) {
                walk(fullPath);
            }
            else if (file === 'route.ts' || file === 'route.js') {
                const relativePath = path_1.default.relative(appDir, path_1.default.dirname(fullPath));
                const endpoint = '/' + normalizeRoutePath(relativePath);
                scanRouteHandler(fullPath, endpoint, intents);
            }
        }
    }
    try {
        walk(appDir);
    }
    catch (e) {
        console.error('Error scanning Next.js App Router directory:', e);
    }
}
function scanPagesApi(pagesApiDir, intents) {
    function walk(dir) {
        const entries = fs_1.default.readdirSync(dir);
        for (const entry of entries) {
            const fullPath = path_1.default.join(dir, entry);
            const stat = fs_1.default.statSync(fullPath);
            if (stat.isDirectory()) {
                walk(fullPath);
            }
            else if (/\.(ts|js|mjs|cjs)$/.test(entry) && !entry.endsWith('.d.ts')) {
                const relativePath = path_1.default.relative(pagesApiDir, fullPath);
                const endpoint = '/api/' + normalizePagesApiRoute(relativePath);
                scanPagesApiHandler(fullPath, endpoint, intents);
            }
        }
    }
    try {
        walk(pagesApiDir);
    }
    catch (e) {
        console.error('Error scanning Next.js Pages API directory:', e);
    }
}
function scanRouteHandler(fullPath, endpoint, intents) {
    const content = fs_1.default.readFileSync(fullPath, 'utf-8');
    const methods = detectExportedMethods(content);
    for (const method of methods) {
        const id = `${method.toLowerCase()}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}`;
        if (intents.some(i => i.id === id))
            continue;
        intents.push(buildIntent(id, method, endpoint));
    }
}
function scanPagesApiHandler(fullPath, endpoint, intents) {
    const content = fs_1.default.readFileSync(fullPath, 'utf-8');
    const methods = detectRequestMethods(content);
    for (const method of methods) {
        const id = `${method.toLowerCase()}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}`;
        if (intents.some(i => i.id === id))
            continue;
        intents.push(buildIntent(id, method, endpoint));
    }
}
function detectExportedMethods(content) {
    const methods = new Set();
    for (const entry of EXPORT_METHODS) {
        if (entry.regex.test(content)) {
            methods.add(entry.method);
        }
    }
    return Array.from(methods);
}
function detectRequestMethods(content) {
    const methods = new Set();
    for (const pattern of REQ_METHOD_PATTERNS) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const method = match[1].toUpperCase();
            methods.add(method);
        }
    }
    if (methods.size === 0) {
        // Fallback to common API methods if no explicit request checks were found
        methods.add('GET');
        methods.add('POST');
    }
    return Array.from(methods);
}
function normalizeRoutePath(route) {
    let normalized = route.replace(/\\/g, '/');
    normalized = normalized.replace(/\/\/+/g, '/');
    normalized = normalized.replace(/\[\.\.\.\.\.\.\]/g, ':splat*');
    normalized = normalized.replace(/\[\.\.\.\.\.\]/g, ':splat*');
    normalized = normalized.replace(/\[\.\.\.\.]/g, ':splat*');
    normalized = normalized.replace(/\[\.\.\.]/g, ':splat*');
    normalized = normalized.replace(/\[(\.\.\.)?(\w+)\]/g, (_, __, name) => name ? `:${name}` : '');
    normalized = normalized.replace(/\/\/_index$/, '');
    normalized = normalized.replace(/^_index$/, '');
    normalized = normalized.replace(/^\/+/, '');
    return normalized.replace(/\/+$|^$/, '');
}
function normalizePagesApiRoute(relativePath) {
    let route = relativePath.replace(/\.(ts|js|mjs|cjs)$/, '');
    route = route.replace(/\\/g, '/');
    if (route.endsWith('/index')) {
        route = route.slice(0, -'/index'.length);
    }
    route = route.replace(/\[\.\.\.(\w+)\]/g, ':$1*');
    route = route.replace(/\[(\w+)\]/g, ':$1');
    route = route.replace(/\/+/g, '/');
    route = route.replace(/\/+$/, '');
    return route.replace(/^\/|\/$/g, '');
}
function buildIntent(id, method, endpoint) {
    return {
        id,
        name: `${method} ${endpoint}`,
        description: `Auto-generated intent for ${method} ${endpoint}`,
        method: method,
        endpoint,
        triggers: [`call ${endpoint}`, `${method.toLowerCase()} ${endpoint}`],
        category: 'developer',
        requires_auth: false,
        destructive: method === 'DELETE',
        confirmation_required: method === 'DELETE',
    };
}
