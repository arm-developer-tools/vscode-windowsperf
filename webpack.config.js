/**
 * Copyright 2024 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        '@arm-debug/ctrlc-windows': 'commonjs @arm-debug/ctrlc-windows',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        fallback: {
            os: require.resolve('os-browserify'),
        },
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
