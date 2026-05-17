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
    // Write jin.json
    const outputPath = path_1.default.join(cwd, 'jin.json');
    fs_1.default.writeFileSync(outputPath, JSON.stringify(scaffold, null, 2));
    console.log(`✓ Generated jin.json with ${scaffold.intents.length} intent(s)`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Open jin.json and fill in the TODO fields');
    console.log('  2. Add natural language triggers to each intent');
    console.log('  3. Run: npx jin validate');
    console.log('  4. Run: npx jin serve  (to test locally)');
    console.log('  5. Run: npx jin publish (to list on meetjin.com)');
    console.log('');
}
