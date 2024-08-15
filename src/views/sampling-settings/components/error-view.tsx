/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { VSCodeButton, VSCodeLink } from '@vscode/webview-ui-toolkit/react';
import { ErrorDetail } from '../messages';

export type ErrorViewProps = {
    error: ErrorDetail;
    openWperfOutput: () => void;
    refreshView: () => void;
};

export const versionMismatchErrorMessage =
    'An error has occured while trying to run "wperf list". The versions of wperf and wperf-driver do not match. To ensure compatibility, both wperf and wperf-driver must be the same version. Please update either wperf or wperf-driver so that both versions are identical.';

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
    if (props.error.type === 'versionMismatch') {
        errorMessage = versionMismatchErrorMessage;
    }
    return (
        <div className="error-view">
            <i className="codicon codicon-warning" />
            <p id="error-message">{errorMessage}</p>
            <p className="helper-text">
                <VSCodeLink href={docslink}>Get help with installing WindowsPerf</VSCodeLink>
            </p>
            <div className="error-view-button-strip">
                <VSCodeButton id="retry-button" title="retry" onClick={props.refreshView}>
                    Retry
                </VSCodeButton>
                <VSCodeButton
                    id="show-wperf-output-button"
                    title="Open Log"
                    onClick={props.openWperfOutput}
                >
                    Open Log
                </VSCodeButton>
            </div>
        </div>
    );
};
