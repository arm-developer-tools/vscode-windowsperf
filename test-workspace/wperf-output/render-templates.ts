import * as path from 'path';
import * as fs from 'fs';

const outputRootDir = __dirname;
const dirs = {
    workspace: path.join(outputRootDir, '..'),
    templates: path.join(outputRootDir, 'templates'),
    rendered: path.join(outputRootDir, 'rendered'),
};

function readTemplate(fileName: string): string {
    const absFilePath = path.join(dirs.templates, fileName);
    return fs.readFileSync(absFilePath, { encoding: 'ascii' });
}

function renderTemplate(template: string) {
    return template
        // normalize windows paths (YOLO!)
        .replace(/\\\\/g, path.sep)
        // root file paths in test workspace
        .replace(/\${WORKSPACE}/g, dirs.workspace);
}

function writeRenderedTemplate(rendered: string, fileName: string) {
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
        console.log(`Rendered: ${fileName}`);
    }
}

main();
