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

// See: https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#configuring-your-testing-environment
(global as any).IS_REACT_ACT_ENVIRONMENT = true;

// Fixes errors in tests, when components from vscode-webview-ui-toolkit are used.
if (typeof window !== 'undefined') {
    // Only in jsdom
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(), // Deprecated
            removeListener: jest.fn(), // Deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    });

    const { TextDecoder, TextEncoder } = require('node:util');

    Object.defineProperties(globalThis, {
        TextDecoder: { value: TextDecoder },
        TextEncoder: { value: TextEncoder },
    });
}

const originalConsoleError = console.error;
console.error = (error: unknown) => {
    // Ignore errors from JSDOM's CSS parsing implementation
    if (
        typeof error === 'object' &&
        error !== null &&
        'toString' in error &&
        error.toString().startsWith('Error: Could not parse CSS stylesheet')
    ) {
        return;
    }

    originalConsoleError(error);
};
