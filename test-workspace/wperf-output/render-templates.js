#!/usr/bin/env node
/* eslint-disable */

const fs = require('fs');
const os = require('os');
const path = require('path');

const outputRootDir = __dirname;
const dirs = {
    workspace: path.join(outputRootDir, '..'),
    templates: path.join(outputRootDir, 'templates'),
    rendered: path.join(outputRootDir, 'rendered'),
};

function readTemplate(fileName) {
    const absFilePath = path.join(dirs.templates, fileName);
    return fs.readFileSync(absFilePath, { encoding: 'ascii' });
}

function renderTemplate(template) {
    // normalize windows paths for other systems (YOLO!)
    const templateWithFixedPaths = os.platform() === 'win32' ? template : template.replace(/\\\\/g, path.sep);
    // root file paths in test workspace
    return templateWithFixedPaths.replace(/\${WORKSPACE}/g, dirs.workspace.replace(/\\/g, '\\\\'));
}

function writeRenderedTemplate(rendered, fileName) {
    const absFilePath = path.join(dirs.rendered, fileName);
    return fs.writeFileSync(absFilePath, rendered);
}

function main() {
    fs.mkdirSync(dirs.rendered, { recursive: true });
    const filesToRender = fs.readdirSync(dirs.templates);
    for (const fileName of filesToRender) {
        const template = readTemplate(fileName);
        const rendered = renderTemplate(template);
        writeRenderedTemplate(rendered, fileName);
    }
}

if (require.main === module) {
    main();
    console.log(`Rendered generated files at ${dirs.rendered}`);
}

module.exports = { renderTemplates: main };