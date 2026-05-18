"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveJinJsonPath = resolveJinJsonPath;
exports.promptUser = promptUser;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Resolves the path to jin.json based on common directory structures.
 * Checks in order:
 * 1. public/.well-known/jin.json
 * 2. .well-known/jin.json
 * 3. jin.json
 */
function resolveJinJsonPath(cwd = process.cwd()) {
    const paths = [
        path_1.default.join(cwd, 'public', '.well-known', 'jin.json'),
        path_1.default.join(cwd, '.well-known', 'jin.json'),
        path_1.default.join(cwd, 'jin.json')
    ];
    for (const p of paths) {
        if (fs_1.default.existsSync(p)) {
            return p;
        }
    }
    return null;
}
const readline_1 = __importDefault(require("readline"));
function promptUser(query) {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans.trim().toLowerCase());
    }));
}
