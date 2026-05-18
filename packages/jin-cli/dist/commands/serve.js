"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serve = serve;
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const utils_1 = require("../utils");
function serve(options, cwd = process.cwd()) {
    const jinJsonPath = (0, utils_1.resolveJinJsonPath)(cwd);
    if (!jinJsonPath) {
        console.log('✗ jin.json not found — run: npx jin init');
        process.exit(1);
    }
    const jinJson = fs_1.default.readFileSync(jinJsonPath, 'utf-8');
    const server = http_1.default.createServer((req, res) => {
        if (req.url === '/.well-known/jin.json') {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(jinJson);
        }
        else {
            res.writeHead(404);
            res.end();
        }
    });
    server.listen(parseInt(options.port), () => {
        console.log(`\n✓ Serving intent map at:`);
        console.log(`  http://localhost:${options.port}/.well-known/jin.json\n`);
    });
}
