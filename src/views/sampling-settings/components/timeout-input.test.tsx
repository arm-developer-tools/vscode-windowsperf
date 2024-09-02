import { render, screen } from '@testing-library/react';
import { TimeoutSeconds } from './timeout-input';
import { recordOptionsFactory } from '../../../wperf/record-options.factories';
import React from 'react';
import { formPropsFactory } from './form.test';

describe('Timeout input', () => {
    it('shows a warning for a 2 hour timeout', () => {
        const props = formPropsFactory({
            recordOptions: recordOptionsFactory({ timeoutSeconds: 7200 }),
        });
        render(<TimeoutSeconds {...props} onChange={jest.fn()} />);
        expect(
            screen.getByText('Timeout = 2 hours', {
                exact: false,
                selector: '.warning-message',
            }),
        ).toBeInTheDocument();
    });

    it('does not show a warning for a timeout that is less than 1 hour', () => {
        const props = formPropsFactory({
            recordOptions: recordOptionsFactory({ timeoutSeconds: 10 }),
        });

        render(<TimeoutSeconds {...props} onChange={jest.fn()} />);

        expect(
            screen.queryByText('Timeout', { exact: false, selector: '.warning-message' }),
        ).not.toBeInTheDocument();
    });
});
