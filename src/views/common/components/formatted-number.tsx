/**
 * Copyright (C) 2024 Arm Limited
 */

import * as React from 'react';

type FormattedNumberProps = {
    value: number;
};

export const FormattedNumber = ({ value }: FormattedNumberProps) => {
    const formatted = new Intl.NumberFormat().format(value);

    return <p>{formatted}</p>;
};
