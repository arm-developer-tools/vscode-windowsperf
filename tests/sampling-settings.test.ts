/*
 * Copyright (c) 2024 Arm Limited
 */

import { test, expect } from '@arm-debug/vscode-playwright-test';
import path from 'node:path';

test.describe('Sampling Settings', () => {
    test.use({ extensionDevelopmentPath: path.resolve(__dirname, '../../') });

    const toggleSidebarShortcut = 'ControlOrMeta+B';
    const toggleBottomPanelShortcut = 'ControlOrMeta+J';

    test.skip('opens the sampling setting with the error display', async ({ vscode }) => {
        await vscode.page.keyboard.press(toggleSidebarShortcut);
        await vscode.page.keyboard.press(toggleBottomPanelShortcut);
        await vscode.page.getByText('WindowsPerf').click();
        await vscode.page.getByRole('button', { name: 'Show Sampling Settings' }).click();
        const parentFrame = vscode.page.frameLocator('iframe[class="webview ready"]');
        const childFrame = parentFrame.frameLocator('#active-frame');

        await expect(childFrame.getByText('Command failed:')).toBeVisible();
    });
});
