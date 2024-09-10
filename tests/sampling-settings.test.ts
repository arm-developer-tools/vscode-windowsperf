/*
 * Copyright (c) 2024 Arm Limited
 */

import { test, expect } from '@arm-debug/vscode-playwright-test';
import path from 'node:path';

const TEST_WORKSPACE = path.join(__dirname, '../', 'test-workspace');

const MOCK_PERF_PATH = path.join(
    TEST_WORKSPACE,
    process.platform === 'win32' ? 'wperf.bat' : 'wperf.js',
);

test.describe('Sampling Settings', async () => {
    const openSettingsShortcut = 'ControlOrMeta+,';

    test.use({
        extensionDevelopmentPath: path.resolve(__dirname, '../../'),
    });

    const filePath = 'somefile.exe';

    test('run a Record and show the treeitem', async ({ vscode }) => {
        await vscode.page.keyboard.press(openSettingsShortcut);
        await vscode.page.keyboard.type('windowsperf');
        await vscode.page.getByLabel('windowsPerf.wperfPath').waitFor();
        await vscode.page.getByLabel('windowsPerf.wperfPath').fill(MOCK_PERF_PATH);
        await vscode.runCommandFromPalette('View: Toggle WindowsPerf');
        await vscode.page.getByRole('button', { name: 'Show Sampling Settings' }).click();
        const parentFrame = vscode.page.frameLocator('iframe[class="webview ready"]');
        const childFrame = parentFrame.frameLocator('#active-frame');
        await childFrame.locator('div.file-picker-input').waitFor();
        await childFrame.locator('div.file-picker-input').getByRole('textbox').fill(filePath);
        await childFrame.locator('span').filter({ hasText: 'Event' }).click();
        await childFrame.locator('div').filter({ hasText: 'ase' }).nth(0).click();
        await childFrame.getByRole('button', { name: 'Add' }).click();
        await childFrame.locator('div.row-actions').waitFor();
        await vscode.page.getByRole('button', { name: 'Record', exact: true }).click();
        await vscode.page.getByText(filePath, { exact: true }).waitFor({ timeout: 60000 });
        await expect(vscode.page.getByText(filePath, { exact: true })).toBeVisible();
    });
});
