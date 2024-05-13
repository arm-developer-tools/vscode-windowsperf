/*
 * Copyright (c) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { faker } from '@faker-js/faker';
import { TextEditorHandler } from './text-editor';

export type MockVscodeTextEditorHandler = jest.Mocked<TextEditorHandler>;

export const textEditorHandlerFactory = (): MockVscodeTextEditorHandler => ({
    getVisibleTextEditors: jest.fn(),
    onDidChangeVisibleTextEditors: jest.fn(),
    createTextEditorDecorationType: jest.fn()
});

export type MockVscodeTextEditor = jest.Mocked<vscode.TextEditor>;

export const vscodeTextEditorFactory = (options?: { document: vscode.TextDocument }): MockVscodeTextEditor => {
    return {
        document: options?.document || vscodeTextDocumentFactory(),
        options: expect.any(Object),
        selection: expect.any(Object),
        selections: [],
        viewColumn: faker.number.int(),
        visibleRanges: [],
        edit: jest.fn(),
        insertSnippet: jest.fn(),
        setDecorations: jest.fn(),
        revealRange: jest.fn(),
        show: jest.fn(),
        hide: jest.fn()
    };
};

export const vscodeTextDocumentFactory = (options?: { uri: vscode.Uri}): vscode.TextDocument => {
    return {
        uri: options?.uri || vscode.Uri.parse(faker.system.filePath()),
        fileName: faker.word.noun(),
        isUntitled: true,
        languageId: faker.word.noun(),
        version: faker.number.int(),
        isDirty: false,
        isClosed: false,
        lineCount: faker.word.noun().length,
        getText: jest.fn(),
        lineAt: jest.fn().mockReturnValue(faker.number.int()),
        offsetAt: jest.fn(),
        positionAt: jest.fn()
    } as unknown as vscode.TextDocument;
};

export const createTextEditorDecorationTypeFactory = () => ({
    key: faker.word.noun(),
    dispose: jest.fn(),
});
