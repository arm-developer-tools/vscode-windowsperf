/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { recordOptionsFactory } from '../../../wperf/record-options.factories';
import { Footer } from './footer';
import { buildRecordArgs } from '../../../wperf/record-options';

describe('Footer', () => {
    it('renders the wperf command line', () => {
        const recordOptions = recordOptionsFactory();

        render(<Footer recordOptions={recordOptions} record={jest.fn()} />);

        expect(
            screen.queryByText(buildRecordArgs(recordOptions, false), { exact: false }),
        ).toBeInTheDocument();
    });
    it('calls record when the record event button is clicked', () => {
        const recordOptions = recordOptionsFactory();
        const record = jest.fn();
        render(<Footer record={record} recordOptions={recordOptions} />);

        const recordButton = screen.getAllByText('Record');
        fireEvent.click(recordButton[0]!);

        expect(record).toHaveBeenCalled();
    });
});
