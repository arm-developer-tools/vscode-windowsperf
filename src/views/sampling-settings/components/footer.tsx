/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { RecordOptions, buildRecordArgs } from '../../../wperf/record-options';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';

export type FooterProps = {
    recordOptions: RecordOptions;
};

export const Footer = (props: FooterProps) => {
    const commandLine = `wperf ${buildRecordArgs(props.recordOptions)}`;

    const copyCommandLine = () => {
        navigator.clipboard.writeText(commandLine);
    };

    return (
        <footer>
            <h1>Command Line Preview</h1>
            <div className="footer-display">{commandLine}</div>
            <div className="footer-controls">
                <VSCodeButton onClick={copyCommandLine}>Copy</VSCodeButton>
            </div>
        </footer>
    );
};
