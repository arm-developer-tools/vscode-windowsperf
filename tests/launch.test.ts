import { test, expect } from '@arm-debug/vscode-playwright-test';
import path from 'node:path';

test.describe('Running WindowsPerf', () => {
    test.use({ extensionDevelopmentPath: path.resolve(__dirname, '../../') });

    test('a WindowsPerf tab appears in the bottom panel', async ({ vscode }) => {
        test.setTimeout(60000);
        await vscode.page.keyboard.press('ControlOrMeta+B'); // Closes the sidebar
        await vscode.page.keyboard.press('ControlOrMeta+J'); // Opens the bottom panel
        await vscode.page.getByText('WindowsPerf').waitFor();
        expect(vscode.page.getByText('WindowsPerf')).toBeVisible();
    });
});
