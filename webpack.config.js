//@ts-check
'use strict';

const path = require('path');

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const common = {
    mode: 'development',
    externals: {
        // modules added here also need to be added in the .vscodeignore file
        vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
        'ctrlc-windows': 'commonjs ctrlc-windows',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    infrastructureLogging: {
        level: 'log', // enables logging required for problem matchers
    },
};

/**
 * @param {*} _env
 * @param {*} argv
 * @returns WebpackConfig[]
 */
module.exports = (_env, argv) => [
    {
        ...common,
        devtool: 'nosources-source-map',
        target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
        entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
        output: {
            // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
            path: path.resolve(__dirname, 'dist'),
            filename: 'extension.js',
            libraryTarget: 'commonjs2',
        },
    },
    {
        ...common,
        target: 'web',
        // The VS Code devtools can't load up source maps for webview code, so we must include them inline.
        // This increases the bundle size a lot, so only do this in development mode.
        devtool: argv.mode === 'production' ? false : 'inline-source-map',
        entry: {
            'sampling-settings': './src/views/sampling-settings/view.ts',
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist', 'views'),
        },
    },
];
