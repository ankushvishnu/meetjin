#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const init_1 = require("./commands/init");
const validate_1 = require("./commands/validate");
const publish_1 = require("./commands/publish");
const serve_1 = require("./commands/serve");
const watch_1 = require("./commands/watch");
const program = new commander_1.Command();
program
    .name('jin')
    .description('Agent Intent Protocol — make your app agent-ready')
    .version('0.1.0');
program
    .command('init')
    .description('Scan your codebase and generate a jin.json scaffold')
    .action(() => (0, init_1.init)(process.cwd()));
program
    .command('validate')
    .description('Validate your jin.json against the AIP specification')
    .action(() => (0, validate_1.validateAndPrint)(process.cwd()));
program
    .command('serve')
    .description('Serve your jin.json at /.well-known/jin.json for testing')
    .option('-p, --port <port>', 'Port to serve on', '3001')
    .action((options) => (0, serve_1.serve)(options, process.cwd()));
program
    .command('publish')
    .description('Publish your jin.json to the meetjin.com registry')
    .option('--skip-deploy', 'Skip automated deployment via git')
    .action((options) => (0, publish_1.publish)(options, process.cwd()));
program
    .command('watch')
    .description('Watch your codebase and update jin.json automatically')
    .action(() => (0, watch_1.watch)(process.cwd()));
program.parse();
