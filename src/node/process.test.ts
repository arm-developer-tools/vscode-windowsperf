/**
 * Copyright (C) 2024 Arm Limited
 */

import { ctrlc } from 'ctrlc-windows';
import { logger } from '../logging/logger';
import { exec } from './process';
import { CancellationTokenSource } from 'vscode';

const onWindows = (testFn: () => void) => {
    const describeFn = process.platform === 'win32' ? describe : describe.skip;
    describeFn('on windows', testFn);
};

describe('exec', () => {
    it('executes the command and returns the result', async () => {
        const command = 'node -e "console.log(\'Hello, World!\')"';

        const result = await exec(command);

        expect(result).toEqual({
            stdout: 'Hello, World!\n',
            stderr: '',
        });
    });

    onWindows(() => {
        it('handles cancellation by sending CTCL+C to the process', async () => {
            const command = 'node -e "console.log(\'Hello!\');"';
            const tokenSource = new CancellationTokenSource();

            const promise = exec(command, {}, tokenSource.token);
            tokenSource.cancel();

            await promise;

            expect(ctrlc).toHaveBeenCalled();
        });
    });

    it('throws an error if the command fails', async () => {
        const command = 'node -e "process.exit(1)"';

        await expect(exec(command)).rejects.toThrow();
    });

    it('throws an error if the command does not exist', async () => {
        const command = 'nonexistent-command';

        await expect(exec(command)).rejects.toThrow();
    });

    it('passes cwd to the child process', async () => {
        const command = 'node -e "console.log(process.cwd())"';
        const cwd = __dirname;

        const result = await exec(command, { cwd });

        expect(result.stdout.trim()).toEqual(cwd);
    });

    it('logs appropriately on success', async () => {
        const jsScript = "console.log('STDOUT message'); console.error('STDERR message')";
        const command = `node -e "${jsScript}"`;

        await exec(command);

        expect(logger.info).toHaveBeenCalledWith(`> node -e "${jsScript}"`);
        expect(logger.debug).toHaveBeenCalledWith('STDERR message');
        expect(logger.trace).toHaveBeenCalledWith('STDOUT message');
    });

    it('logs appropriately on error', async () => {
        const jsScript = "console.log('OH NO!'); process.exit(1)";
        const command = `node -e "${jsScript}"`;

        await expect(exec(command)).rejects.toThrow();

        expect(logger.info).toHaveBeenCalledWith(`> node -e "${jsScript}"`);
        expect(logger.info).toHaveBeenCalledWith('Command failed with code 1');
    });
});
