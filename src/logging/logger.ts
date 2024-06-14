/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

export const logger = vscode.window.createOutputChannel('WindowsPerf', {
    log: true,
});
