"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanSupabaseFunctions = scanSupabaseFunctions;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Supabase Edge Functions Scanner.
 * Scans supabase/functions/ directory for edge function definitions
 * and extracts them as intents.
 */
async function scanSupabaseFunctions(cwd) {
    const intents = [];
    const supabaseDir = path_1.default.join(cwd, 'supabase');
    const functionsDir = path_1.default.join(supabaseDir, 'functions');
    if (!fs_1.default.existsSync(functionsDir))
        return intents;
    // Try to find the Supabase Project URL
    let projectUrl = 'https://TODO-supabase-project.supabase.co';
    // 1. Check .supabase/project-ref
    const refPath = path_1.default.join(cwd, '.supabase', 'project-ref');
    if (fs_1.default.existsSync(refPath)) {
        try {
            const ref = fs_1.default.readFileSync(refPath, 'utf-8').trim();
            if (ref) {
                projectUrl = `https://${ref}.supabase.co`;
            }
        }
        catch { }
    }
    // 2. Check .env / .env.local
    if (projectUrl.includes('TODO')) {
        const envPaths = ['.env', '.env.local', '.env.development'];
        for (const envFile of envPaths) {
            const p = path_1.default.join(cwd, envFile);
            if (fs_1.default.existsSync(p)) {
                try {
                    const content = fs_1.default.readFileSync(p, 'utf-8');
                    const match = content.match(/(SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL)\s*=\s*(https:\/\/[^\s'"]+)/);
                    if (match && match[2]) {
                        projectUrl = match[2].trim();
                        break;
                    }
                }
                catch { }
            }
        }
    }
    let functionDirs = [];
    try {
        functionDirs = fs_1.default.readdirSync(functionsDir);
    }
    catch {
        return intents;
    }
    for (const dirName of functionDirs) {
        const fullPath = path_1.default.join(functionsDir, dirName);
        let stat;
        try {
            stat = fs_1.default.statSync(fullPath);
        }
        catch {
            continue;
        }
        if (!stat.isDirectory())
            continue;
        // Check for index.ts or index.js
        const files = ['index.ts', 'index.js'];
        let handlerPath = null;
        for (const f of files) {
            if (fs_1.default.existsSync(path_1.default.join(fullPath, f))) {
                handlerPath = path_1.default.join(fullPath, f);
                break;
            }
        }
        if (!handlerPath)
            continue;
        // Parse Edge Function
        try {
            const content = fs_1.default.readFileSync(handlerPath, 'utf-8');
            const methods = [];
            // Simple regex / string checks for methods
            if (content.includes("req.method === 'GET'") || content.includes('req.method === "GET"') || content.includes("method === 'GET'")) {
                methods.push('GET');
            }
            if (content.includes("req.method === 'POST'") || content.includes('req.method === "POST"') || content.includes("method === 'POST'")) {
                methods.push('POST');
            }
            if (content.includes("req.method === 'PUT'") || content.includes('req.method === "PUT"') || content.includes("method === 'PUT'")) {
                methods.push('PUT');
            }
            if (content.includes("req.method === 'DELETE'") || content.includes('req.method === "DELETE"') || content.includes("method === 'DELETE'")) {
                methods.push('DELETE');
            }
            // Default to POST if no explicit method checks are found
            if (methods.length === 0) {
                methods.push('POST');
            }
            const endpoint = `${projectUrl}/functions/v1/${dirName}`;
            for (const method of methods) {
                const id = `${method.toLowerCase()}_supabase_${dirName.replace(/[^a-zA-Z0-9]/g, '_')}`;
                intents.push({
                    id,
                    name: `${dirName} Edge Function (${method})`,
                    description: `Supabase Edge Function at ${endpoint}`,
                    method: method,
                    endpoint,
                    triggers: [
                        `run supabase function ${dirName}`,
                        `call edge function ${dirName}`,
                        `execute ${dirName}`
                    ],
                    category: 'developer',
                    requires_auth: true,
                    destructive: method === 'DELETE',
                    confirmation_required: method === 'DELETE'
                });
            }
        }
        catch (e) {
            console.error(`Error scanning Supabase function ${dirName}:`, e);
        }
    }
    return intents;
}
