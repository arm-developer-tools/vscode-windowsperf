/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { VSCodeLink } from '@vscode/webview-ui-toolkit/react';
import { ErrorDetail } from '../messages';

export type ErrorViewProps = {
    error: ErrorDetail;
};

export const ErrorView = (props: ErrorViewProps) => {
    let errorMessage = props.error.message;
    const docslink =
        'https://gitlab.com/Linaro/WindowsPerf/windowsperf/-/blob/3.5.0-beta/INSTALL.md';

    if (props.error.type === 'noWperfDriver') {
        errorMessage =
            'An error has occurred communicating with the wperf-driver while trying to run "wperf list".';
    }
    if (props.error.type === 'noWperf') {
        errorMessage =
            'WindowsPerf executable not found while running "wperf list". Is it on the PATH or configured in the extension settings?';
    }
    return (
        <div className="error-view">
            <i className="codicon codicon-warning" />
            <p id="error-message">{errorMessage}</p>
            <p className="helper-text">
                <VSCodeLink href={docslink}>Get help with installing WindowsPerf</VSCodeLink>
            </p>
        </div>
    );
};
