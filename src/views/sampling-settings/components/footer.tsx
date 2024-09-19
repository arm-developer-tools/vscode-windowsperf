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
                    <span className="cmd-preview-text">{commandLine}</span>
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
