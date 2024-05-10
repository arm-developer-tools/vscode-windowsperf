/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { OpenResultFile } from './open-result-file';
import { ObservableCollection } from '../observable-collection';
import { SampleFile } from '../views/sampling-results/sample-file';
import { sampleFileFactory } from '../views/sampling-results/sample-file.factories';


describe('OpenResultFile.execute', () => {
    it('adds file selected by the user to the file list', async () => {
        const selectedFileUri = vscode.Uri.file('foo.json');
        const vscodeWindow = {
            showOpenDialog: jest.fn().mockResolvedValue([selectedFileUri]),
            showErrorMessage: jest.fn(),
        };
        const builtFile = sampleFileFactory();
        const sampleFileFromUri = jest.fn().mockResolvedValue(builtFile);
        const files = new ObservableCollection<SampleFile>();
        const command = new OpenResultFile(files, vscodeWindow, sampleFileFromUri);

        await command.execute();

        const wantFiles: SampleFile[] = [builtFile];
        expect(files.items).toEqual(wantFiles);
        expect(sampleFileFromUri).toHaveBeenCalledWith(selectedFileUri);
    });

    it('when file creation errors, it displays the error and retains existing file list', async () => {
        const selectedFileUri = vscode.Uri.file('foo.json');
        const vscodeWindow = {
            showOpenDialog: jest.fn().mockResolvedValue([selectedFileUri]),
            showErrorMessage: jest.fn(),
        };
        const sampleFileFromUri = jest.fn().mockRejectedValue(new Error('boom!'));
        const files = new ObservableCollection<SampleFile>();
        const command = new OpenResultFile(files, vscodeWindow, sampleFileFromUri);

        await command.execute();

        expect(files.items).toEqual([]);
        expect(vscodeWindow.showErrorMessage).toHaveBeenCalledWith('boom!');
    });
});
