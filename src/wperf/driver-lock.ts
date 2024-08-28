const wperfDriverLockedMessage = 'other WindowsPerf process acquired the wperf-driver';
// This message could be different for different versions of Wperf?
// The error code is always 1 when it fails no matter the error

export const isWperfDriverLocked = (cliErrorMessage: string): boolean =>
    cliErrorMessage.includes(wperfDriverLockedMessage);
