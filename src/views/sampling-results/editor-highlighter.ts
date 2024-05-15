/*
 * Copyright (c) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { ObservableSelection } from '../../observable-selection';
import { SampleFile } from '../sampling-results/sample-file';
import { isSamePath } from '../../path';
import { Decoration, buildDecoration } from './source-code-decoration';

export type TextEditorDecorator = {
    decorate: (decorations: Decoration[]) => void
    dispose: () => void
};

export class EditorHighlighter {
    private readonly eventHandler: vscode.Disposable;

    constructor(
        selectedFile: ObservableSelection<SampleFile>,
        private readonly decorator: TextEditorDecorator = new VscodeTextEditorDecorator(),
    ) {
        this.eventHandler = selectedFile.onDidChange(() => {
            const currentlySelected = selectedFile.selected;
            if (currentlySelected !== null) {
                const decorations = calculateDecorations(currentlySelected);
                decorator.decorate(decorations);
            } else {
                decorator.decorate([]);
            }
        });
    }

    dispose() {
        this.eventHandler.dispose();
        this.decorator.dispose();
    }
}

class VscodeTextEditorDecorator implements TextEditorDecorator  {
    private onDidChangeVisibleTextEditors: vscode.Disposable | undefined;
    private readonly activeDecorations: vscode.TextEditorDecorationType[] = [];

    decorate(decorations: Decoration[]) {
        this.dispose();
        this.decorateEditors(vscode.window.visibleTextEditors, decorations);
        this.onDidChangeVisibleTextEditors = vscode.window.onDidChangeVisibleTextEditors(
            editors => {
                this.clearActiveDecorations();
                this.decorateEditors(editors, decorations);
            }
        );
    }

    dispose() {
        this.onDidChangeVisibleTextEditors?.dispose();
        this.clearActiveDecorations();
    }

    private decorateEditors(
        editors: readonly vscode.TextEditor[],
        decorations: Decoration[],
    ) {
        editors.forEach(editor => {
            const fileDecorations = decorations.filter(decoration =>
                isSamePath(decoration.filename, editor.document.fileName)
            );
            if (fileDecorations) {
                this.decorateEditor(editor, fileDecorations);
            }
        });
    }

    private decorateEditor(editor: vscode.TextEditor, decorations: Decoration[]) {
        for (const decoration of decorations) {
            const decorationType = vscode.window.createTextEditorDecorationType({
                backgroundColor: decoration.backgroundColor,
                overviewRulerColor: decoration.backgroundColor,
            });
            this.activeDecorations.push(decorationType);
            editor.setDecorations(decorationType, [
                {
                    range: editor.document.lineAt(decoration.line_number - 1).range,
                    hoverMessage: new vscode.MarkdownString(decoration.hoverMessage),
                }
            ]);
        }
    }

    private clearActiveDecorations() {
        this.activeDecorations.forEach(d => d.dispose());
        this.activeDecorations.length = 0;
    }
}

export const calculateDecorations = (sample: SampleFile): Decoration[] => {
    const decorations: Decoration[] = [];
    for (const event of sample.parsedContent.sampling.events) {
        for (const annotation of event.annotate) {
            for (const sourceCode of annotation.source_code) {
                decorations.push(buildDecoration(event, annotation, sourceCode));
            }
        }
    }
    return decorations;
};
