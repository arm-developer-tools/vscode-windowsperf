/**
 * Copyright (C) 2024 Arm Limited
 */

import React from 'react';
import { formatNumber } from '../../../math';

type FormattedNumberProps = {
    value: number;
};

export const FormattedNumber = ({ value }: FormattedNumberProps) => {
    return <span>{formatNumber(value)}</span>;
};
