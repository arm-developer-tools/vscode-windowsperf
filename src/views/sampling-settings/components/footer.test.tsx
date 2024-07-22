/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { recordOptionsFactory } from '../../../wperf/record-options.factories';
import { Footer } from './footer';
import { buildRecordArgs } from '../../../wperf/record-options';

describe('Footer', () => {
    it('renders the wperf command line', () => {
        const recordOptions = recordOptionsFactory();

        render(<Footer recordOptions={recordOptions} />);

        expect(
            screen.queryByText(buildRecordArgs(recordOptions), { exact: false }),
        ).toBeInTheDocument();
    });
});
