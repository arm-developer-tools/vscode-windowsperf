/*
 * Copyright (c) 2024 Arm Limited
 */

import * as vscode from 'vscode';

export const focusSamplingResults = () => {
    vscode.commands.executeCommand('samplingResults.focus');
};
