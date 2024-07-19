/**
 * Copyright (C) 2024 Arm Limited
 */

import { logger } from '../logging/logger';
import { SamplingSettingsWebviewPanel } from '../views/sampling-settings/panel';

export class ShowSamplingSettings {
    constructor(private readonly panel: SamplingSettingsWebviewPanel) {}

    readonly execute = async () => {
        logger.info('Executing windowsperf.showSamplingSettings');
        this.panel.show();
    };
}
