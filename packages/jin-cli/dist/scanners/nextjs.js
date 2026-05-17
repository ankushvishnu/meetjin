"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanNextJS = scanNextJS;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Very basic Next.js App Router scanner.
 * Looks for route.ts files and extracts endpoints.
 */
async function scanNextJS(cwd) {
    const intents = [];
    const appDir = fs_1.default.existsSync(path_1.default.join(cwd, 'src/app'))
        ? path_1.default.join(cwd, 'src/app')
        : fs_1.default.existsSync(path_1.default.join(cwd, 'app'))
            ? path_1.default.join(cwd, 'app')
            : null;
    if (!appDir)
        return intents;
    function walk(dir) {
        const files = fs_1.default.readdirSync(dir);
        for (const file of files) {
            const fullPath = path_1.default.join(dir, file);
            const stat = fs_1.default.statSync(fullPath);
            if (stat.isDirectory()) {
                walk(fullPath);
            }
            else if (file === 'route.ts' || file === 'route.js') {
                // Found a route file
                const relativePath = path_1.default.relative(appDir, dir);
                const endpoint = '/' + relativePath.replace(/\\/g, '/');
                // Read file to detect methods
                const content = fs_1.default.readFileSync(fullPath, 'utf-8');
                const methods = [];
                if (content.includes('export async function GET'))
                    methods.push('GET');
                if (content.includes('export async function POST'))
                    methods.push('POST');
                if (content.includes('export async function PUT'))
                    methods.push('PUT');
                if (content.includes('export async function DELETE'))
                    methods.push('DELETE');
                if (content.includes('export async function PATCH'))
                    methods.push('PATCH');
                for (const method of methods) {
                    const id = `${method.toLowerCase()}_${relativePath.replace(/[^a-zA-Z0-9]/g, '_')}`;
                    intents.push({
                        id,
                        name: `${method} ${endpoint}`,
                        description: `Auto-generated intent for ${method} ${endpoint}`,
                        method: method,
                        endpoint,
                        triggers: [`call ${endpoint}`, `${method.toLowerCase()} ${endpoint}`],
                        category: 'developer', // Default
                        requires_auth: false,
                        destructive: method === 'DELETE',
                        confirmation_required: method === 'DELETE'
                    });
                }
            }
        }
    }
    try {
        walk(appDir);
    }
    catch (e) {
        console.error('Error scanning Next.js directory:', e);
    }
    return intents;
}
