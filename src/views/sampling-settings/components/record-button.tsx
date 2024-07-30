/*
 * Copyright (c) 2024 Arm Limited
 */

import React from 'react';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';

type RecordButtonProps = {
    onClick: () => void;
};

export const RecordButton = (props: RecordButtonProps) => {
    return (
        <VSCodeButton onClick={props.onClick}>
            Record
            <span slot="start" className="codicon codicon-record"></span>
        </VSCodeButton>
    );
};
