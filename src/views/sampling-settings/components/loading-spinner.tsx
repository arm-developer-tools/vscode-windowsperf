/**
 * Copyright (C) 2024 Arm Limited
 */

import { VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';
import React from 'react';

export const LoadingSpinner = () => {
    return (
        <div className="loading-spinner">
            <VSCodeProgressRing></VSCodeProgressRing>
        </div>
    );
};
