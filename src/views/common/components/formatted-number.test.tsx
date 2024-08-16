/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';
import 'jest';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { FormattedNumber } from './formatted-number';

describe('Formatted Number', () => {
    it('formats value correctly using Intl number format', () => {
        const numberToFormat = 1000000;
        const { container } = render(<FormattedNumber value={numberToFormat} />);
        const text = container.getElementsByTagName('p').item(0);

        expect(text).toHaveTextContent(new Intl.NumberFormat().format(numberToFormat));
    });
});
