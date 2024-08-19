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

type ErrorMessageMap = {
    [key in Exclude<ErrorDetail['type'], 'unknown'>]: string;
};

export const errorMessages: ErrorMessageMap = {
    noWperfDriver:
        'An error has occurred communicating with the wperf-driver while trying to run "wperf list".',
    noWperf:
        'WindowsPerf executable not found while running "wperf list". Is it on the PATH or configured in the extension settings?',
    versionMismatch:
        'An error has occured while trying to run "wperf list". The versions of wperf and wperf-driver do not match. To ensure compatibility, both wperf and wperf-driver must be the same version. Please update either wperf or wperf-driver so that both versions are identical.',
};
export const ErrorView = (props: ErrorViewProps) => {
    const docslink = 'https://gitlab.com/Linaro/WindowsPerf/windowsperf/-/blob/main/INSTALL.md';
    let errorMessage = 'An unknown error has occurred';

    if (props.error.type !== 'unknown') {
        errorMessage = errorMessages[props.error.type];
    } else if (props.error.message) {
        errorMessage = props.error.message;
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
