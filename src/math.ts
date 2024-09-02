/*
 * Copyright (c) 2024 Arm Limited
 */

export const percentage = (value: number, total: number): number => {
    return (value * 100) / total;
};

export const formatFraction = (toFormat: number, fractionDigits: number = 2): number => {
    return parseFloat(toFormat.toFixed(fractionDigits));
};

export const formatNumber = (toFormat: number): string => {
    return new Intl.NumberFormat().format(toFormat);
};
