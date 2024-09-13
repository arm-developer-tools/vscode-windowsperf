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

export const canEnableWindowsOnArmFeatures = (
    platform: NodeJS.Platform,
    arch: NodeJS.Architecture,
    wperfPath?: string,
) => {
    const isWindowsOnArm = platform === 'win32' && (arch === 'arm' || arch === 'arm64');
    const wperfPathConfig = wperfPath || '';

    return isWindowsOnArm || wperfPathConfig.length > 0;
};

type ContextOptions = {
    'windowsperf.initialised': boolean;
    'windowsperf.hasWindowsOnArmFeatures': boolean;
};

export class ContextManager {
    constructor(
        private readonly updateContext = setContext,
        private readonly getConfig = getConfiguration,
    ) {
        this.setHasWindowsOnArmFeaturesContext();
        this.setInitialisedContext();
    }

    public readonly handleConfigurationChange = (events: vscode.ConfigurationChangeEvent) => {
        if (events.affectsConfiguration('windowsPerf.wperfPath')) {
            this.setHasWindowsOnArmFeaturesContext();
        }
    };

    public readonly setHasWindowsOnArmFeaturesContext = () => {
        this.updateContext(
            'windowsperf.hasWindowsOnArmFeatures',
            canEnableWindowsOnArmFeatures(
                process.platform,
                process.arch,
                this.getConfig('wperfPath'),
            ),
        );
    };

    private readonly setInitialisedContext = () => {
        this.updateContext('windowsperf.initialised', true);
    };
}

const setContext = <K extends keyof ContextOptions>(setting: K, value: ContextOptions[K]) => {
    vscode.commands.executeCommand('setContext', setting, value);
};

const getConfiguration = (name: string) => {
    const config: string | undefined = vscode.workspace.getConfiguration('windowsPerf').get(name);
    return config;
};
