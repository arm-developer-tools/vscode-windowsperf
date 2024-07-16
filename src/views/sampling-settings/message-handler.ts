/**
 * Copyright (C) 2024 Arm Limited
 */

import { logger } from '../../logging/logger';
import { SamplingSettings } from '../../sampling-settings';
import { Core, getCpuInfo } from '../../wperf/cores';
import { RecordOptions } from '../../wperf/record-options';
import { runList } from '../../wperf/run';
import { EventsLoadResult, ToView, fromViewShape } from './messages';

export type SamplingSettingsMessageHandler = {
    handleMessage: (message: unknown) => Promise<ToView | undefined>;
};

export class SamplingSettingsMessageHandlerImpl implements SamplingSettingsMessageHandler {
    private readonly eventsPromise: Promise<EventsLoadResult> | undefined;

    constructor(
        private readonly samplingSettings: SamplingSettings,
        private readonly getPredefinedEvents = runList,
    ) {
        // Start loading while the webview content loads, to improve start up time
        this.eventsPromise = this.loadEvents();
    }

    public readonly handleMessage = async (message: unknown): Promise<ToView | undefined> => {
        const parseResult = fromViewShape.safeParse(message);

        if (parseResult.success) {
            const fromViewMessage = parseResult.data;
            logger.debug('Message from SamplingSettings view', fromViewMessage);

            switch (fromViewMessage.type) {
                case 'ready': {
                    return this.handleReady();
                }
                case 'recordOptions':
                    return this.handleRecordOptions(fromViewMessage.recordOptions);
            }
        } else {
            logger.error('Received invalid message from webview', parseResult.error, message);
        }

        return undefined;
    };

    public readonly handleReady = async (): Promise<ToView> => {
        return {
            type: 'initialData',
            recordOptions: this.samplingSettings.recordOptions,
            cores: this.listCores(),
            events: await (this.eventsPromise || this.loadEvents()),
        };
    };

    public readonly handleRecordOptions = async (
        recordOptions: RecordOptions,
    ): Promise<undefined> => {
        this.samplingSettings.recordOptions = recordOptions;
        return undefined;
    };

    private readonly listCores = (): Core[] => {
        return getCpuInfo();
    };

    private readonly loadEvents = async (): Promise<EventsLoadResult> => {
        try {
            const events = await this.getPredefinedEvents();
            return { type: 'success', events };
        } catch (error) {
            return { type: 'error', error: {} };
        }
    };
}
