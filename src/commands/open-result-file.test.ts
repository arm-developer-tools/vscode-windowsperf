/**
 * Copyright (C) 2024 Arm Limited
 */

import {
    OpenResultFile,
    openFileAtUriOrPrompt,
    promptUserToSelectResultFile,
} from './open-result-file';
import { ObservableCollection } from '../observable-collection';
import { SampleFile } from '../views/sampling-results/sample-file';
import { sampleFileFactory } from '../views/sampling-results/sample-file.factories';
import { ObservableSelection } from '../observable-selection';
import { faker } from '@faker-js/faker';
import { Uri } from 'vscode';
import { logErrorAndNotify } from '../logging/error-logging';
import { SampleSource } from '../views/sampling-results/sample-source';
import { analyticsFactory } from '@arm-debug/vscode-telemetry/lib/analytics.factories';
import { treeDataNodeFactory } from '../views/sampling-results/tree-data-provider.factories';

describe('OpenResultFile', () => {
    describe('execute', () => {
        it('adds opened file to the file list', async () => {
            const file = sampleFileFactory();
            const openFileOrPrompt = jest.fn(async () => file);
            const files = new ObservableCollection<SampleSource>();
            const command = new OpenResultFile(
                files,
                new ObservableSelection(),
                analyticsFactory(),
                openFileOrPrompt,
                jest.fn(),
            );

            await command.execute(file.uri);

            const got = files.items.map((file) => file.context);
            const wantFiles = [{ type: 'file', result: file }];
            expect(got).toEqual(wantFiles);
        });

        it('when file opening fails, it retains existing file list', async () => {
            const openFileOrPrompt = jest.fn().mockResolvedValue(undefined);
            const files = new ObservableCollection<SampleSource>();
            const command = new OpenResultFile(
                files,
                new ObservableSelection(),
                analyticsFactory(),
                openFileOrPrompt,
                jest.fn(),
            );

            await command.execute(Uri.file(faker.system.filePath()));

            expect(files.items).toEqual([]);
        });

        it('selects the loaded file', async () => {
            const file = sampleFileFactory();
            const openFileOrPrompt = jest.fn(async () => file);
            const files = new ObservableCollection<SampleSource>();
            const selectedFile = new ObservableSelection<SampleSource>();
            const command = new OpenResultFile(
                files,
                selectedFile,
                analyticsFactory(),
                openFileOrPrompt,
                jest.fn(),
            );

            await command.execute(file.uri);

            const got = selectedFile.selected?.context.result;

            expect(got).toEqual(file);
        });

        it('focuses on the sampling results treeview', async () => {
            const openFileOrPrompt = jest.fn(async () => file);
            const focusOnSamplingResults = jest.fn();
            const file = sampleFileFactory();
            const command = new OpenResultFile(
                new ObservableCollection<SampleSource>(),
                new ObservableSelection(),
                analyticsFactory(),
                openFileOrPrompt,
                focusOnSamplingResults,
            );

            await command.execute(file.uri);

            expect(focusOnSamplingResults).toHaveBeenCalled;
        });

        it('ignores a tree node passed as command argument, treats as undefined Uri', async () => {
            const file = sampleFileFactory();
            const treeDataNode = treeDataNodeFactory();
            const openFileOrPrompt = jest.fn(async () => file);
            const files = new ObservableCollection<SampleSource>();
            const command = new OpenResultFile(
                files,
                new ObservableSelection(),
                analyticsFactory(),
                openFileOrPrompt,
                jest.fn(),
            );

            await command.execute(treeDataNode);
            expect(openFileOrPrompt).toHaveBeenCalledWith(undefined);
        });
    });

    describe('openFileAtUriOrPrompt', () => {
        it('loads file at the Uri given', async () => {
            const uri = Uri.file(faker.system.filePath());
            const promptUserToSelectFile: jest.MockedFn<typeof promptUserToSelectResultFile> =
                jest.fn();
            const loadFile: jest.MockedFn<typeof SampleFile.fromUri> = jest.fn();
            const sampleFile = sampleFileFactory();
            loadFile.mockResolvedValue(sampleFile);

            const result = await openFileAtUriOrPrompt(uri, promptUserToSelectFile, loadFile);

            expect(promptUserToSelectFile).not.toHaveBeenCalled();
            expect(result).toEqual(sampleFile);
        });

        it('prompts the user to select a file if no Uri is given and loads the selected file', async () => {
            const uri = Uri.file(faker.system.filePath());
            const promptUserToSelectFile: jest.MockedFn<typeof promptUserToSelectResultFile> =
                jest.fn();
            promptUserToSelectFile.mockResolvedValue(uri);
            const sampleFile = sampleFileFactory();
            const loadFile: jest.MockedFn<typeof SampleFile.fromUri> = jest.fn();
            loadFile.mockResolvedValue(sampleFile);

            const result = await openFileAtUriOrPrompt(undefined, promptUserToSelectFile, loadFile);

            expect(promptUserToSelectFile).toHaveBeenCalled();
            expect(result).toEqual(sampleFile);
        });

        it('returns undefined when the user does not select a Uri', async () => {
            const promptUserToSelectFile: jest.MockedFn<typeof promptUserToSelectResultFile> =
                jest.fn();
            promptUserToSelectFile.mockResolvedValue(undefined);
            const sampleFile = sampleFileFactory();
            const loadFile: jest.MockedFn<typeof SampleFile.fromUri> = jest.fn();
            loadFile.mockResolvedValue(sampleFile);

            const result = await openFileAtUriOrPrompt(undefined, promptUserToSelectFile, loadFile);

            expect(promptUserToSelectFile).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });

        it('returns undefined and logs an error if the file fails to load', async () => {
            const sampleFile = sampleFileFactory();
            const promptUserToSelectFile: jest.MockedFn<typeof promptUserToSelectResultFile> =
                jest.fn();
            promptUserToSelectFile.mockResolvedValue(sampleFile.uri);
            const loadFile: jest.MockedFn<typeof SampleFile.fromUri> = jest.fn();
            const error = new Error('Failed to load file');
            loadFile.mockRejectedValue(error);

            const result = await openFileAtUriOrPrompt(undefined, promptUserToSelectFile, loadFile);

            expect(result).toBeUndefined();
            expect(logErrorAndNotify).toHaveBeenCalledWith(error, 'Failed to load result file.');
        });
    });
});
