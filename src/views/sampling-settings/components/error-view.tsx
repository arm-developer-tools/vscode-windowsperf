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

import * as React from 'react';
import { VSCodeButton, VSCodeLink } from '@vscode/webview-ui-toolkit/react';
import { ErrorDetail } from '../messages';

export type ErrorViewProps = {
    error: ErrorDetail;
    openWperfOutput: () => void;
    refreshView: () => void;
    runSystemCheck: () => void;
};

type ErrorMessageMap = {
    [key in Exclude<ErrorDetail['type'], 'unknown'>]: string;
};

export const errorMessages: ErrorMessageMap = {
    noWperfDriver:
        'There was an error communicating with the wperf-driver while trying to run WindowsPerf. Check that you have installed the wperf-driver correctly.',
    noWperf:
        'WindowsPerf executable not found while running WindowsPerf. Is it on the PATH or configured in the extension settings?',
    versionMismatch:
        'There was an error running “wperf” because the versions of wperf and wperf-driver do not match. Make sure that both are the same version by updating either one.',
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
                    appearance="secondary"
                >
                    Open Log
                </VSCodeButton>
                <VSCodeButton
                    id="run-system-check-button"
                    title="Run System Check"
                    onClick={props.runSystemCheck}
                    appearance="secondary"
                >
                    Run System Check
                </VSCodeButton>
            </div>
        </div>
    );
};
