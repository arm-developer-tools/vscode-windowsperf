/**
 * Copyright 2024 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as vscode from 'vscode';
import { ObservableSelection } from '../../observable-selection';
import { isSamePath } from '../../path';
import { Decoration, buildDecoration } from './source-code-decoration';
import { SampleSource } from './sample-source';
import { groupHitsByFiles, groupHitsOnSameFileLine, Sample } from '../../wperf/parse/record';

export type TextEditorDecorator = {
    decorate: (decorations: Decoration[]) => void;
    dispose: () => void;
};

export class EditorHighlighter {
    private readonly eventHandler: vscode.Disposable;

    constructor(
        selectedFile: ObservableSelection<SampleSource>,
        private readonly decorator: TextEditorDecorator = new VscodeTextEditorDecorator(),
    ) {
        this.eventHandler = selectedFile.onDidChange(() => {
            const currentlySelected = selectedFile.selected;
            if (currentlySelected !== null) {
                const decorations = calculateDecorations(
                    currentlySelected.context.result.parsedContent,
                );
                this.decorator.decorate(decorations);
            } else {
                this.decorator.decorate([]);
            }
        });
    }

    dispose() {
        this.eventHandler.dispose(), this.decorator.dispose();
    }
}

class VscodeTextEditorDecorator implements TextEditorDecorator {
    private onDidChangeVisibleTextEditors: vscode.Disposable | undefined;
    private readonly activeDecorations: vscode.TextEditorDecorationType[] = [];

    decorate(decorations: Decoration[]) {
        this.dispose();
        this.decorateEditors(vscode.window.visibleTextEditors, decorations);
        this.onDidChangeVisibleTextEditors = vscode.window.onDidChangeVisibleTextEditors(
            (editors) => {
                this.clearActiveDecorations();
                this.decorateEditors(editors, decorations);
            },
        );
    }

    dispose() {
        this.onDidChangeVisibleTextEditors?.dispose();
        this.clearActiveDecorations();
    }

    private decorateEditors(editors: readonly vscode.TextEditor[], decorations: Decoration[]) {
        editors.forEach((editor) => {
            const fileDecorations = decorations.filter((decoration) =>
                isSamePath(decoration.filename, editor.document.fileName),
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
                after: decoration.after,
            });
            this.activeDecorations.push(decorationType);
            editor.setDecorations(decorationType, [
                {
                    range: editor.document.lineAt(decoration.lineNumber - 1).range,
                    hoverMessage: new vscode.MarkdownString(decoration.hoverMessage),
                },
            ]);
        }
    }

    private clearActiveDecorations() {
        this.activeDecorations.forEach((d) => d.dispose());
        this.activeDecorations.length = 0;
    }
}

export const calculateDecorations = (sample: Sample) => {
    const groupedByFileMap = groupHitsByFiles(sample);
    const decorations: Decoration[] = [];
    groupedByFileMap.forEach((file, filename) => {
        const groupedByLineMap = groupHitsOnSameFileLine(file);

        groupedByLineMap.forEach((line) => {
            decorations.push(
                buildDecoration({ filename, totalSampleHits: sample.totalCount, ...line }),
            );
        });
    });
    return decorations;
};
