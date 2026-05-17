"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanOpenAPI = scanOpenAPI;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * OpenAPI / Swagger scanner.
 * Reads an openapi.json / swagger.json file and converts operations to AIP intents.
 * Supports both OpenAPI 3.x and Swagger 2.x formats (JSON only for now).
 */
async function scanOpenAPI(filePath) {
    const intents = [];
    if (!fs_1.default.existsSync(filePath))
        return intents;
    // Only support JSON for now (YAML would need a parser dep)
    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
        console.log('   ⚠ YAML OpenAPI specs require the yaml package — skipping. Convert to JSON or install yaml.');
        return intents;
    }
    let spec;
    try {
        spec = JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
    }
    catch (e) {
        console.log(`   ⚠ Failed to parse ${path_1.default.basename(filePath)}`);
        return intents;
    }
    const paths = spec.paths;
    if (!paths || typeof paths !== 'object') {
        console.log('   ⚠ No paths found in OpenAPI spec');
        return intents;
    }
    for (const [endpoint, methods] of Object.entries(paths)) {
        if (typeof methods !== 'object' || methods === null)
            continue;
        for (const [method, operation] of Object.entries(methods)) {
            const upperMethod = method.toUpperCase();
            if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(upperMethod))
                continue;
            const op = operation;
            const operationId = op.operationId || `${method}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const summary = op.summary || '';
            const description = op.description || summary || `${upperMethod} ${endpoint}`;
            const tags = op.tags || [];
            // Try to infer a category from tags
            const category = inferCategory(tags);
            // Build triggers from summary
            const triggers = [];
            if (summary) {
                triggers.push(summary.toLowerCase());
            }
            triggers.push(`${method} ${endpoint}`);
            if (description && description !== summary) {
                // Take first sentence
                const firstSentence = description.split('.')[0].trim();
                if (firstSentence && !triggers.includes(firstSentence.toLowerCase())) {
                    triggers.push(firstSentence.toLowerCase());
                }
            }
            // Detect auth requirements
            const requiresAuth = !!(op.security && op.security.length > 0) ||
                !!(spec.security && spec.security.length > 0);
            // Build parameters description
            const params = {};
            if (op.parameters) {
                for (const param of op.parameters) {
                    if (param.name && param.in !== 'header') {
                        params[param.name] = {
                            type: param.schema?.type || 'string',
                            description: param.description || '',
                            required: param.required || false,
                        };
                    }
                }
            }
            intents.push({
                id: operationId.replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_'),
                name: summary || `${upperMethod} ${endpoint}`,
                description,
                triggers,
                category,
                method: upperMethod,
                endpoint,
                parameters: Object.keys(params).length > 0 ? params : undefined,
                requires_auth: requiresAuth,
                destructive: upperMethod === 'DELETE',
                confirmation_required: upperMethod === 'DELETE',
            });
        }
    }
    return intents;
}
/**
 * Try to map OpenAPI tags to AIP categories.
 */
function inferCategory(tags) {
    const tagStr = tags.join(' ').toLowerCase();
    const mapping = {
        'shop': 'commerce', 'product': 'commerce', 'cart': 'commerce', 'order': 'commerce', 'payment': 'commerce',
        'travel': 'travel', 'flight': 'travel', 'hotel': 'travel', 'booking': 'travel',
        'task': 'productivity', 'project': 'productivity', 'calendar': 'productivity', 'todo': 'productivity',
        'message': 'communication', 'chat': 'communication', 'email': 'communication', 'notification': 'communication',
        'finance': 'finance', 'bank': 'finance', 'invoice': 'finance', 'billing': 'finance',
        'auth': 'identity', 'user': 'identity', 'account': 'identity', 'login': 'identity',
        'health': 'healthcare', 'patient': 'healthcare', 'medical': 'healthcare', 'fitness': 'healthcare',
        'legal': 'legal', 'contract': 'legal', 'compliance': 'legal',
        'government': 'government', 'civic': 'government',
        'education': 'education', 'course': 'education', 'student': 'education',
        'media': 'media', 'video': 'media', 'image': 'media', 'content': 'media',
        'api': 'developer', 'webhook': 'developer', 'integration': 'developer',
        'data': 'data', 'analytics': 'data', 'report': 'data',
        'social': 'social', 'feed': 'social', 'profile': 'social',
        'local': 'local', 'location': 'local', 'map': 'local',
    };
    for (const [keyword, category] of Object.entries(mapping)) {
        if (tagStr.includes(keyword))
            return category;
    }
    return 'developer';
}
