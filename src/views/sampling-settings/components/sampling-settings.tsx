/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { WebviewApi } from 'vscode-webview';

export type SamplingSettingsProps = {
    api: WebviewApi<unknown>;
};

export const SamplingSettings = () => {
    return <h1>Sampling Settings</h1>;
};
