/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { ObservableCollection } from '../observable-collection';
import { SampleFile } from '../views/sampling-results/tree-data-provider';
import { OpenResultFile } from './open-result-file';
import { loadSampleFile } from '../wperf/load';
import { absoluteFixturePath } from '../wperf/fixtures';


describe('OpenResultFile.execute', () => {
    it('adds file selected by the user to the file list', async () => {
        const selectedFileUri = vscode.Uri.file(absoluteFixturePath('wperf-3.3.3.record.json'));
        const files = new ObservableCollection<SampleFile>();
        const vscodeWindow = {
            showOpenDialog: jest.fn().mockResolvedValue([selectedFileUri]),
            showErrorMessage: jest.fn(),
        };
        const command = new OpenResultFile(files, vscodeWindow);

        await command.execute();

        const wantFiles: SampleFile[] = [
            {
                uri: selectedFileUri,
                parsedContent: await loadSampleFile(selectedFileUri.fsPath),
            },
        ];
        expect(files.items).toEqual(wantFiles);
    });

    it('does not expand file list when file is not parseable', async () => {
        const selectedFileUri = vscode.Uri.file(absoluteFixturePath('unparseable.json'));
        const vscodeWindow = {
            showOpenDialog: jest.fn().mockResolvedValue([selectedFileUri]),
            showErrorMessage: jest.fn(),
        };
        const files = new ObservableCollection<SampleFile>();
        const command = new OpenResultFile(files, vscodeWindow);

        await command.execute();

        expect(files.items).toEqual([]);
    });

    it('shows error when file is not parseable', async () => {
        const selectedFileUri = vscode.Uri.file(absoluteFixturePath('unparseable.json'));
        const vscodeWindow = {
            showOpenDialog: jest.fn().mockResolvedValue([selectedFileUri]),
            showErrorMessage: jest.fn(),
        };
        const files = new ObservableCollection<SampleFile>();
        const command = new OpenResultFile(files, vscodeWindow);

        await command.execute();

        const wantErrorMessage = await extractThrownErrorMessage(async () => {
            await loadSampleFile(selectedFileUri.fsPath);
        });
        expect(vscodeWindow.showErrorMessage).toHaveBeenCalledWith(wantErrorMessage);
    });
});

const extractThrownErrorMessage = async (throwingFn: () => Promise<void>): Promise<string> => {
    try {
        await throwingFn();
    } catch (error: unknown) {
        if (error instanceof Error) {
            return error.message;
        }
    }
    return '';
};
