/**
 * Copyright (C) 2024 Arm Limited
 */

import { OpenResultFile, openResultFile } from './open-result-file';
import { ObservableCollection } from '../observable-collection';
import { SampleFile } from '../views/sampling-results/sample-file';
import { sampleFileFactory } from '../views/sampling-results/sample-file.factories';
import { ObservableSelection } from '../observable-selection';
import { Uri } from 'vscode';

describe('OpenResultFile.execute', () => {
    it('adds opened file to the file list', async () => {
        const file = sampleFileFactory();
        const openFile = jest.fn().mockResolvedValue(file);
        const files = new ObservableCollection<SampleFile>();
        const command = new OpenResultFile(files, new ObservableSelection(), openFile);

        await command.execute();

        const wantFiles: SampleFile[] = [file];
        expect(files.items).toEqual(wantFiles);
    });

    it('when file opening fails, it retains existing file list', async () => {
        const openFile = jest.fn().mockResolvedValue(undefined);
        const files = new ObservableCollection<SampleFile>();
        const command = new OpenResultFile(files, new ObservableSelection(), openFile);

        await command.execute();

        expect(files.items).toEqual([]);
    });

    it('selects first loaded file when none are loaded', async () => {
        const file = sampleFileFactory();
        const openFile = jest.fn().mockResolvedValue(file);
        const files = new ObservableCollection<SampleFile>();
        const selectedFile = new ObservableSelection<SampleFile>();
        const command = new OpenResultFile(files, selectedFile, openFile);

        await command.execute();

        expect(selectedFile.selected).toEqual(file);
    });

    it('loading n-th file does not affect selection', async () => {
        const openFile = jest.fn().mockResolvedValue(sampleFileFactory());
        const files = new ObservableCollection<SampleFile>([
            sampleFileFactory(), sampleFileFactory()
        ]);
        const selectedFile = new ObservableSelection<SampleFile>();
        const command = new OpenResultFile(files, selectedFile, openFile);

        await command.execute();

        expect(selectedFile.selected).toBeNull();
    });
});

describe('openResultFile', () => {
    it('returns parseable file selected by the user', async () => {
        const selectedFileUri = Uri.file('foo.json');
        const vscodeWindow = {
            showOpenDialog: jest.fn().mockResolvedValue([selectedFileUri]),
            showErrorMessage: jest.fn(),
        };
        const builtFile = sampleFileFactory();
        const sampleFileFromUri = jest.fn().mockResolvedValue(builtFile);

        const got = await openResultFile(vscodeWindow, sampleFileFromUri);

        expect(got).toEqual(builtFile);
        expect(sampleFileFromUri).toHaveBeenCalledWith(selectedFileUri);
    });

    it('when file parsing errors, it displays the error and returns undefined', async () => {
        const selectedFileUri = Uri.file('foo.json');
        const vscodeWindow = {
            showOpenDialog: jest.fn().mockResolvedValue([selectedFileUri]),
            showErrorMessage: jest.fn(),
        };
        const sampleFileFromUri = jest.fn().mockRejectedValue(new Error('boom!'));

        const got = await openResultFile(vscodeWindow, sampleFileFromUri);

        expect(got).toBeUndefined();
        expect(vscodeWindow.showErrorMessage).toHaveBeenCalledWith('boom!');
    });
});
