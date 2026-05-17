"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publish = publish;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const validate_1 = require("./validate");
const REGISTRY_URL = process.env.JIN_REGISTRY_URL || 'https://meetjin.com/api/v1';
async function publish(cwd = process.cwd()) {
    const jinJsonPath = path_1.default.join(cwd, 'jin.json');
    // Validate first
    console.log('Validating jin.json...');
    const validation = (0, validate_1.validate)(jinJsonPath);
    if (!validation.valid) {
        console.log('✗ Validation failed. Fix errors before publishing.');
        process.exit(1);
    }
    console.log('✓ Valid\n');
    // Load jin.json
    const jinJson = JSON.parse(fs_1.default.readFileSync(jinJsonPath, 'utf-8'));
    // Check for API key
    const apiKey = process.env.JIN_API_KEY;
    if (!apiKey) {
        console.log('✗ JIN_API_KEY not set');
        console.log('  Get your API key at: https://meetjin.com/dashboard');
        console.log('  Then set it: export JIN_API_KEY=your_key_here');
        process.exit(1);
    }
    // Verify domain ownership
    console.log(`Verifying domain: ${jinJson.app.url}`);
    const intentMapUrl = `${jinJson.app.url}/.well-known/jin.json`;
    try {
        const res = await fetch(intentMapUrl);
        if (!res.ok) {
            console.log(`✗ Cannot reach ${intentMapUrl}`);
            console.log('  Run: npx jin serve — then deploy jin.json to your server');
            process.exit(1);
        }
        console.log('✓ Intent map reachable\n');
    }
    catch {
        console.log(`✗ Cannot reach ${intentMapUrl}`);
        console.log('  Make sure jin.json is deployed and accessible');
        process.exit(1);
    }
    // Publish to registry
    console.log('Publishing to meetjin.com registry...');
    const response = await fetch(`${REGISTRY_URL}/publisher/apps`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            name: jinJson.app.name,
            url: jinJson.app.url,
            description: jinJson.app.description,
            logo_url: jinJson.app.logo,
            contact_email: jinJson.app.contact,
            intent_map_url: intentMapUrl,
            is_community: false
        })
    });
    if (!response.ok) {
        const error = await response.json();
        console.log(`✗ Publish failed: ${error.message}`);
        process.exit(1);
    }
    const data = await response.json();
    console.log(`✓ Published successfully\n`);
    console.log(`  Registry URL: ${data.registry_url}`);
    console.log(`  Intents imported: ${data.intents_imported}`);
    console.log(`  Status: ${data.status}`);
    console.log('');
    console.log('  Agents can now discover your intents at:');
    console.log(`  https://meetjin.com/api/v1/registry/apps/${data.slug}`);
}
