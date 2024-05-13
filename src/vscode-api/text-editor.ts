/*
 * Copyright (c) 2024 Arm Limited
 */

import { DecorationRenderOptions, Disposable, TextEditor, TextEditorDecorationType, window } from 'vscode';

export interface TextEditorHandler {
    getVisibleTextEditors(): readonly TextEditor[];
    onDidChangeVisibleTextEditors(whenTextEditorChange: (editor: readonly TextEditor[]) => any): Disposable;
    createTextEditorDecorationType(options: DecorationRenderOptions): TextEditorDecorationType;
}

export class TextEditorHandlerImpl implements TextEditorHandler {

    getVisibleTextEditors(): readonly TextEditor[] {
        return window.visibleTextEditors;
    }

    createTextEditorDecorationType(options: DecorationRenderOptions): TextEditorDecorationType {
        return window.createTextEditorDecorationType(options);
    }

    onDidChangeVisibleTextEditors(whenTextEditorChange: (editor: readonly TextEditor[]) => any): Disposable {
        return window.onDidChangeVisibleTextEditors(whenTextEditorChange);
    }
}
