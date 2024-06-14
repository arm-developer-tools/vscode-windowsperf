/*
 * Copyright (c) 2024 Arm Limited
 */

export const generateTimeStamp = (): string => {
    const timeStamp = Date.now();
    const dateTime = new Date(timeStamp);
    return `${dateTime.getFullYear()}-${dateTime.getMonth() + 1}-${dateTime.getDate()}, ${dateTime.toLocaleTimeString()}`;
};
