"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = init;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const nextjs_1 = require("../scanners/nextjs");
const react_router_1 = require("../scanners/react-router");
const express_1 = require("../scanners/express");
const openapi_1 = require("../scanners/openapi");
const vite_react_1 = require("../scanners/vite-react");
async function init(cwd = process.cwd()) {
    console.log('🔍 Jin — scanning your codebase...\n');
    const detectedIntents = [];
    let packageJson = {};
    try {
        packageJson = JSON.parse(fs_1.default.readFileSync(path_1.default.join(cwd, 'package.json'), 'utf-8'));
    }
    catch (e) {
        console.log('   Warning: No package.json found');
    }
    // Detect framework
    const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
    };
    if (deps['next']) {
        console.log('   Detected: Next.js');
        const intents = await (0, nextjs_1.scanNextJS)(cwd);
        detectedIntents.push(...intents);
        console.log(`   Found ${intents.length} routes/endpoints`);
    }
    if (deps['react-router-dom'] || deps['react-router']) {
        console.log('   Detected: React Router');
        const intents = await (0, react_router_1.scanReactRouter)(cwd);
        detectedIntents.push(...intents);
        console.log(`   Found ${intents.length} routes`);
    }
    if (deps['express']) {
        console.log('   Detected: Express');
        const intents = await (0, express_1.scanExpress)(cwd);
        detectedIntents.push(...intents);
        console.log(`   Found ${intents.length} endpoints`);
    }
    if (deps['vite'] && deps['react']) {
        console.log('   Detected: Vite + React SPA');
        const intents = await (0, vite_react_1.scanViteReact)(cwd);
        detectedIntents.push(...intents);
        console.log(`   Found ${intents.length} routes`);
    }
    // Check for existing OpenAPI spec
    const openApiPaths = ['openapi.json', 'openapi.yaml', 'swagger.json', 'swagger.yaml'];
    for (const p of openApiPaths) {
        if (fs_1.default.existsSync(path_1.default.join(cwd, p))) {
            console.log(`   Detected: OpenAPI spec (${p})`);
            const intents = await (0, openapi_1.scanOpenAPI)(path_1.default.join(cwd, p));
            detectedIntents.push(...intents);
            console.log(`   Imported ${intents.length} operations`);
        }
    }
    console.log('');
    // Build scaffold
    const scaffold = {
        aip_version: '0.1',
        app: {
            name: packageJson.name || 'My App',
            description: packageJson.description || 'TODO: describe what your app does',
            url: 'https://TODO.your-domain.com',
            contact: 'TODO: dev@your-domain.com'
        },
        auth: {
            type: 'none'
        },
        intents: detectedIntents.map(intent => ({
            id: intent.id || 'TODO_intent_id',
            name: intent.name || 'TODO: Intent name',
            description: intent.description || 'TODO: What does this intent do in plain language?',
            triggers: intent.triggers || [
                'TODO: natural language phrase that maps to this intent',
                'TODO: alternative phrasing'
            ],
            category: intent.category || 'developer',
            method: intent.method || 'GET',
            endpoint: intent.endpoint || '/TODO',
            parameters: intent.parameters || {},
            requires_auth: intent.requires_auth ?? false,
            destructive: intent.destructive ?? false,
            confirmation_required: intent.confirmation_required ?? false
        })),
        published: new Date().toISOString(),
        registry: {
            verified: false
        }
    };
    // Determine output path
    let outDir = cwd;
    if (fs_1.default.existsSync(path_1.default.join(cwd, 'public'))) {
        outDir = path_1.default.join(cwd, 'public', '.well-known');
        console.log('   Found public/ directory — placing intent map there.');
    }
    else {
        outDir = path_1.default.join(cwd, '.well-known');
        console.log('   No public/ directory found — placing intent map in root .well-known/');
    }
    if (!fs_1.default.existsSync(outDir)) {
        fs_1.default.mkdirSync(outDir, { recursive: true });
    }
    const outputPath = path_1.default.join(outDir, 'jin.json');
    fs_1.default.writeFileSync(outputPath, JSON.stringify(scaffold, null, 2));
    console.log(`✓ Generated jin.json with ${scaffold.intents.length} intents`);
    if (outDir !== cwd) {
        console.log(`✓ Copied to ${path_1.default.relative(cwd, outputPath)}`);
    }
    console.log('\nNext steps:');
    console.log(`  1. Review ${path_1.default.relative(cwd, outputPath) || 'jin.json'} and fill in descriptions`);
    console.log('  2. Run: npx @meetjin/cli validate');
    console.log('  3. Commit and deploy your app');
    console.log(`     git add ${path_1.default.relative(cwd, outputPath) || 'jin.json'}`);
    console.log('     git commit -m "feat: add AIP intent map"');
    console.log('     git push');
    console.log('  4. Once deployed, run: npx @meetjin/cli publish');
    console.log('     (your intent map must be live at');
    console.log('      yourdomain.com/.well-known/jin.json)');
}
