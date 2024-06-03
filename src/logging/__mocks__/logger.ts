/**
 * Copyright (C) 2024 Arm Limited
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
