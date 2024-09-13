#!/usr/bin/env node
/* eslint-disable */

const fs = require('fs');
const path = require('path');
const { renderTemplates } = require('./wperf-output/render-templates');

if (!fs.existsSync(path.join(__dirname, 'wperf-output', 'rendered'))) {
    renderTemplates();
}

const recordOutputPath = path.join(__dirname, 'wperf-output', 'rendered', 'cpython-multi-sample-output.json')
const listOutputPath = path.join(__dirname, '../', 'src', 'wperf' ,'fixtures', 'wperf-3.5.0.list.json');
const testOutputTextPath = path.join(__dirname, 'wperf-output', 'templates', 'wperf-3.5.0-test-output.txt');
const testOutputJsonPath = path.join(__dirname, 'wperf-output', 'templates', 'wperf-3.7.2.test.json');
const versionOutputJsonPath = path.join(__dirname, '../', 'src', 'wperf' ,'fixtures', 'wperf-3.8.0.version.json');

if (process.argv.length <= 2) {
    console.error("No command provided");
    process.exit(1);
} else if (process.argv[2] === "record") {
    let timeoutId;

    const printRecordOutputAndExit = () => {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }

        const stream = fs.createReadStream(recordOutputPath, { encoding: 'ascii' });
        stream.pipe(process.stdout);
    };

    timeoutId = setTimeout(printRecordOutputAndExit, 500);
    process.on('SIGINT', printRecordOutputAndExit);
} else if (process.argv[2] === "list") {
    setTimeout(() => {
        const stream = fs.createReadStream(listOutputPath, { encoding: 'ascii' });
        stream.pipe(process.stdout);
    }, 500);
} else if (process.argv[2] === "test") {
    const returnJson = process.argv.find(arg => arg === "--json");
    setTimeout(() => {
        const stream = fs.createReadStream(returnJson ? testOutputJsonPath : testOutputTextPath, { encoding: 'ascii' });
        stream.pipe(process.stdout);
    }, 500);
} else if (process.argv[2] === "--version") {
    setTimeout(() => {
        const stream = fs.createReadStream(versionOutputJsonPath, { encoding: 'ascii' });
        stream.pipe(process.stdout);
    }, 500);
} else {
    console.error(`Unknown command: ${process.argv[2]}`);
    process.exit(1);
}
