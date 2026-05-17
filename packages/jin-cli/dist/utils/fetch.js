"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchIntentMap = fetchIntentMap;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Fetch a jin.json from a URL and return the parsed content + SHA-256 hash.
 */
async function fetchIntentMap(url) {
    const response = await fetch(url, {
        signal: AbortSignal.timeout(10000),
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'jin-cli/0.1.0'
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    const raw = await response.text();
    const hash = crypto_1.default.createHash('sha256').update(raw).digest('hex');
    const json = JSON.parse(raw);
    return { raw, json, hash };
}
