/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import { RecordOptions, buildRecordArgs } from '../../../wperf/record-options';
import { RecordButton } from './record-button';

export type FooterProps = {
    recordOptions: RecordOptions;
    record: () => void;
};

export const Footer = (props: FooterProps) => {
    const commandLine = `wperf ${buildRecordArgs(props.recordOptions, false)}`;

    const copyCommandLine = () => {
        navigator.clipboard.writeText(commandLine);
    };

    return (
        <footer>
            <div className="command-line-preview-title">Command Line Preview</div>
            <div className="cmd-preview-group">
                <div className="footer-display">
                    {commandLine}
                    <button className="copy-button" title="Copy" onClick={copyCommandLine}>
                        <span className="codicon codicon-copy"></span>
                    </button>
                </div>

                <div className="record-button">
                    <RecordButton onClick={props.record} />
                </div>
            </div>
        </footer>
    );
};
