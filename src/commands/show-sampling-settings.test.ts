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
