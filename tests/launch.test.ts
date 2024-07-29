import { test, expect } from '@arm-debug/vscode-playwright-test';
import path from 'node:path';

test.describe('Loading the WindowsPerf extension', () => {
    test.use({ extensionDevelopmentPath: path.resolve(__dirname, '../../') });

    const toggleSidebarShortcut = 'ControlOrMeta+B';
    const toggleBottomPanelShortcut = 'ControlOrMeta+J';

    test('a WindowsPerf tab appears in the bottom panel', async ({ vscode }) => {
        await vscode.page.keyboard.press(toggleSidebarShortcut);
        await vscode.page.keyboard.press(toggleBottomPanelShortcut);
        await vscode.page.getByText('WindowsPerf').waitFor();
        expect(vscode.page.getByText('WindowsPerf')).toBeVisible();
        await vscode.page.screenshot({ path: 'e2e-screenshots/test.png' });
    });

    test.afterEach(({ vscode }, testInfo) => {
        console.log(`Status: ${testInfo.status}`);
        console.log(`Expected Status: ${testInfo.status}`);
    });
});
