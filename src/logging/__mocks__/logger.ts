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

import 'jest';
import { EventEmitter } from 'vscode';
import type { LogOutputChannel, LogLevel } from 'vscode';

const logLevel: LogLevel.Info = 3;

export const logger: LogOutputChannel = {
    warn: jest.fn(),
    trace: jest.fn(),
    show: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    replace: jest.fn(),
    append: jest.fn(),
    appendLine: jest.fn(),
    clear: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn(),
    logLevel,
    name: 'Test Logger',
    onDidChangeLogLevel: new EventEmitter<LogLevel>().event,
};
