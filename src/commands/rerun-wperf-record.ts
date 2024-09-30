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

import * as vscode from 'vscode';
import { logger } from '../logging/logger';
import { ObservableSelection } from '../observable-selection';
import { SampleSource, isSourceRecordRun } from '../views/sampling-results/sample-source';
import { ObservableCollection } from '../observable-collection';
import { prependSampleAndMakeSelected, record } from '../record';
import { focusSamplingResults } from '../views/sampling-results/focus-sampling-results';
import { Store } from '../store';
import { Analytics } from '@arm-debug/vscode-telemetry';
export class RerunWperfRecord {
    constructor(
        private readonly sources: ObservableCollection<SampleSource>,
        private readonly selectedFile: ObservableSelection<SampleSource>,
        private readonly recentEventsStore: Store<string[]>,
        private readonly analytics: Analytics,
        private readonly runRecord = record,
        private readonly focusResults = focusSamplingResults,
    ) {}

    execute = async (sampleSource: vscode.TreeItem) => {
        logger.info('Executing windowsperf.rerunWperfRecord');

        const recordOptions = this.extractRecordOptions(sampleSource);

        const newSampleSource = await this.runRecord(
            recordOptions,
            this.recentEventsStore,
            this.analytics,
        );
        if (newSampleSource) {
            prependSampleAndMakeSelected(newSampleSource, this.sources, this.selectedFile);
        }
        this.focusResults();
    };

    private extractRecordOptions(sampleSource: vscode.TreeItem) {
        const source = this.sources.items.find((item) => item.id === `${sampleSource.id}`);
        if (!source) {
            throw new Error(
                `Recorded run matching tree item ${sampleSource.id} could not be found.`,
            );
        }
        if (isSourceRecordRun(source.context)) {
            return source.context.result.recordOptions;
        }
        throw new Error(`Tree item ${sampleSource.label} is not a wperf command option`);
    }
}
