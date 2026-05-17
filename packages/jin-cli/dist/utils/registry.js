"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRegistry = searchRegistry;
exports.publishToRegistry = publishToRegistry;
const REGISTRY_URL = 'https://meetjin.com/api/v1';
/**
 * Search the Jin Registry for intents matching a natural language query.
 */
async function searchRegistry(query, options) {
    const params = new URLSearchParams({ q: query });
    if (options?.category)
        params.set('category', options.category);
    if (options?.verified !== undefined)
        params.set('verified', String(options.verified));
    if (options?.community !== undefined)
        params.set('community', String(options.community));
    if (options?.limit)
        params.set('limit', String(options.limit));
    if (options?.offset)
        params.set('offset', String(options.offset));
    const response = await fetch(`${REGISTRY_URL}/registry/search?${params}`);
    if (!response.ok) {
        throw new Error(`Registry search failed: ${response.status}`);
    }
    return response.json();
}
/**
 * Publish an app to the Jin Registry.
 */
async function publishToRegistry(apiKey, payload) {
    const response = await fetch(`${REGISTRY_URL}/publisher/apps`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Publish failed: ${error.message || response.statusText}`);
    }
    return response.json();
}
