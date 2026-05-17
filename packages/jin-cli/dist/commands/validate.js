"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.validateAndPrint = validateAndPrint;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const VALID_CATEGORIES = [
    'commerce', 'travel', 'productivity', 'communication',
    'finance', 'identity', 'healthcare', 'legal',
    'government', 'education', 'media', 'developer',
    'data', 'social', 'local'
];
const VALID_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
function validate(jinJsonPath) {
    const result = { valid: true, errors: [], warnings: [] };
    // Load file
    let jinJson;
    try {
        jinJson = JSON.parse(fs_1.default.readFileSync(jinJsonPath, 'utf-8'));
    }
    catch (e) {
        return { valid: false, errors: ['Cannot parse jin.json — invalid JSON'], warnings: [] };
    }
    // Top level checks
    if (!jinJson.aip_version)
        result.errors.push('Missing: aip_version');
    if (!jinJson.app)
        result.errors.push('Missing: app object');
    if (!jinJson.app?.name)
        result.errors.push('Missing: app.name');
    if (!jinJson.app?.description)
        result.errors.push('Missing: app.description');
    if (!jinJson.app?.url)
        result.errors.push('Missing: app.url');
    if (!jinJson.auth)
        result.errors.push('Missing: auth object');
    if (!jinJson.intents || !Array.isArray(jinJson.intents)) {
        result.errors.push('Missing: intents array');
    }
    // Check for TODO placeholders
    const raw = JSON.stringify(jinJson);
    if (raw.includes('TODO')) {
        result.warnings.push('jin.json contains TODO placeholders — fill these in before publishing');
    }
    // Intent checks
    if (jinJson.intents) {
        const intentIds = new Set();
        jinJson.intents.forEach((intent, idx) => {
            const prefix = `intents[${idx}] (${intent.id || 'unknown'})`;
            if (!intent.id)
                result.errors.push(`${prefix}: missing id`);
            if (!intent.name)
                result.errors.push(`${prefix}: missing name`);
            if (!intent.description)
                result.errors.push(`${prefix}: missing description`);
            if (!intent.method || !VALID_METHODS.includes(intent.method)) {
                result.errors.push(`${prefix}: invalid method — must be one of ${VALID_METHODS.join(', ')}`);
            }
            if (!intent.endpoint)
                result.errors.push(`${prefix}: missing endpoint`);
            if (!intent.category || !VALID_CATEGORIES.includes(intent.category)) {
                result.errors.push(`${prefix}: invalid category`);
            }
            // Triggers quality
            if (!intent.triggers || intent.triggers.length === 0) {
                result.errors.push(`${prefix}: must have at least 1 trigger`);
            }
            else if (intent.triggers.length < 3) {
                result.warnings.push(`${prefix}: has ${intent.triggers.length} trigger(s) — 3+ recommended for better agent matching`);
            }
            // Duplicate IDs
            if (intent.id) {
                if (intentIds.has(intent.id)) {
                    result.errors.push(`Duplicate intent id: ${intent.id}`);
                }
                intentIds.add(intent.id);
            }
            // Destructive intents should require confirmation
            if (intent.destructive && !intent.confirmation_required) {
                result.warnings.push(`${prefix}: is destructive but confirmation_required is false — consider setting to true`);
            }
        });
    }
    result.valid = result.errors.length === 0;
    return result;
}
function validateAndPrint(cwd = process.cwd()) {
    const jinJsonPath = path_1.default.join(cwd, 'jin.json');
    if (!fs_1.default.existsSync(jinJsonPath)) {
        console.log('✗ jin.json not found — run: npx jin init');
        process.exit(1);
    }
    const result = validate(jinJsonPath);
    if (result.errors.length === 0) {
        console.log('✓ jin.json is valid AIP 0.1\n');
    }
    result.errors.forEach(e => console.log(`✗ ${e}`));
    result.warnings.forEach(w => console.log(`⚠ ${w}`));
    if (result.valid) {
        console.log(`\n  ${result.warnings.length === 0 ? 'All good. Run: npx jin publish' : 'Fix warnings for better agent matching.'}`);
    }
    else {
        console.log(`\n  Fix ${result.errors.length} error(s) before publishing.`);
        process.exit(1);
    }
}
