/*
 * Copyright (c) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { ObservableSelection } from '../../observable-selection';
import { SourceCode } from '../../wperf/projected-types';
import { SampleFile } from '../sampling-results/sample-file';
import { TextEditorHandler } from '../../vscode-api/text-editor';

export class WperfResultHighlighter {
    private readonly decorations: vscode.TextEditorDecorationType[] = [];

    constructor(
        private readonly selectedRun: ObservableSelection<SampleFile>,
        private readonly vscodeWindow: TextEditorHandler,
    ) {
        selectedRun.onDidChange(() => {
            this.refreshEditors();
        });

        vscodeWindow.onDidChangeVisibleTextEditors(() => {
            this.refreshEditors();
        });
    }

    private refreshEditors() {
        this.clearHighlights();
        this.selectFileEditor();
    }

    private async selectFileEditor(): Promise<void> {
        this.vscodeWindow.getVisibleTextEditors().forEach(async (editor) => {
            if (this.selectedRun.selected?.parsedContent) {
                this.addEditorHighlights(editor, this.selectedRun.selected);
            }
        });
    }

    private highlight(source: SourceCode, editor: vscode.TextEditor) {
        let colour: string | undefined;
        if (source.hits > 50) {
            colour = 'rgba(255, 0, 0, 0.5)';
        } else if (source.hits > 20) {
            colour = 'rgba(255, 128, 128, 0.5)';
        }
        if (colour) {
            const range = editor.document.lineAt(source.line_number - 1).range;
            const decorType = this.vscodeWindow.createTextEditorDecorationType({ isWholeLine: true, backgroundColor: colour });
            editor.setDecorations(decorType, [range]);
            this.decorations.push(decorType);
        }
    }

    private clearHighlights() {
        this.decorations.forEach(highlight => highlight.dispose());
        this.decorations.splice(0, this.decorations.length);
    }

    private addEditorHighlights(editor: vscode.TextEditor, sampleFile: SampleFile) {
        for (const event of sampleFile.parsedContent.sampling.events) {
            for (const annotate of event.annotate) {
                for (const sourceCode of annotate.source_code) {
                    if (editor.document.uri.fsPath === sourceCode.filename) {
                        this.highlight(sourceCode, editor);
                    }
                }
            }
        }
    }
}
