"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveJinJsonPath = resolveJinJsonPath;
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
