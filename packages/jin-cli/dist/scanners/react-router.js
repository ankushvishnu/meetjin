"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanReactRouter = scanReactRouter;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * React Router scanner for file-based routing (Remix / React Router v7).
 * Scans the routes/ or app/routes/ directory for route files and extracts
 * loader (GET) and action (POST) exports.
 */
async function scanReactRouter(cwd) {
    const intents = [];
    // Find routes directory (Remix convention)
    const routesDirs = [
        path_1.default.join(cwd, 'app', 'routes'),
        path_1.default.join(cwd, 'src', 'routes'),
        path_1.default.join(cwd, 'routes'),
    ];
    let routesDir = null;
    for (const d of routesDirs) {
        if (fs_1.default.existsSync(d)) {
            routesDir = d;
            break;
        }
    }
    if (!routesDir)
        return intents;
    scanRoutesDir(routesDir, routesDir, intents);
    return intents;
}
function scanRoutesDir(dir, baseDir, intents) {
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
            scanRoutesDir(fullPath, baseDir, intents);
        }
        else if (/\.(tsx?|jsx?)$/.test(entry) && !entry.endsWith('.d.ts')) {
            scanRouteFile(fullPath, baseDir, intents);
        }
    }
}
function scanRouteFile(filePath, baseDir, intents) {
    let content;
    try {
        content = fs_1.default.readFileSync(filePath, 'utf-8');
    }
    catch {
        return;
    }
    // Convert file path to route path (Remix flat routes convention)
    const relativePath = path_1.default.relative(baseDir, filePath);
    const routePath = filePathToRoute(relativePath);
    // Skip root layout files
    if (routePath === '/' && !content.includes('loader') && !content.includes('action'))
        return;
    const hasLoader = /export\s+(async\s+)?function\s+loader/m.test(content) ||
        /export\s+const\s+loader/m.test(content);
    const hasAction = /export\s+(async\s+)?function\s+action/m.test(content) ||
        /export\s+const\s+action/m.test(content);
    if (hasLoader) {
        const id = `get_${routePath.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}` || 'get_root';
        intents.push({
            id,
            name: `GET ${routePath}`,
            description: `Remix loader for route ${routePath}`,
            triggers: [`load ${routePath}`, `get ${routePath}`],
            category: 'developer',
            method: 'GET',
            endpoint: routePath,
            requires_auth: false,
            destructive: false,
            confirmation_required: false,
        });
    }
    if (hasAction) {
        const id = `post_${routePath.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}` || 'post_root';
        intents.push({
            id,
            name: `POST ${routePath}`,
            description: `Remix action for route ${routePath}`,
            triggers: [`submit to ${routePath}`, `post ${routePath}`],
            category: 'developer',
            method: 'POST',
            endpoint: routePath,
            requires_auth: false,
            destructive: false,
            confirmation_required: false,
        });
    }
}
/**
 * Convert Remix flat-file route path to URL path.
 * e.g. "users.$userId.tsx" → "/users/:userId"
 *      "api.v1.products.tsx" → "/api/v1/products"
 *      "_index.tsx" → "/"
 */
function filePathToRoute(filePath) {
    // Remove extension
    let route = filePath.replace(/\.(tsx?|jsx?)$/, '');
    // Remove _index suffix
    route = route.replace(/\/_index$/, '').replace(/^_index$/, '');
    // Convert dots to slashes (flat routes)
    route = route.replace(/\./g, '/');
    // Convert $ params to :params
    route = route.replace(/\$(\w+)/g, ':$1');
    // Remove layout prefix (_)
    route = route.replace(/\/_([^/]+)/g, '/$1');
    // Clean up
    route = '/' + route.replace(/^\/+/, '');
    if (route === '/')
        return '/';
    // Remove trailing slashes
    return route.replace(/\/+$/, '');
}
