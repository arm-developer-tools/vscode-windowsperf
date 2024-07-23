/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import { ShowSamplingSettings } from './show-sampling-settings';
import { SamplingSettingsWebviewPanel } from '../views/sampling-settings/panel';

describe('ShowSamplingSettings', () => {
    it('shows the webview panel', async () => {
        const panel: SamplingSettingsWebviewPanel = { show: jest.fn() };
        const command = new ShowSamplingSettings(panel);

        await command.execute();

        expect(panel.show).toHaveBeenCalledWith(false);
    });
});
