/*
 * Copyright (c) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { ObservableSelection } from '../../observable-selection';
import { Event, Annotation, SourceCode } from '../../wperf/projected-types';
import { SampleFile } from '../sampling-results/sample-file';
import { TextEditorHandler, TextEditorHandlerImpl } from '../../vscode-api/text-editor';

export class WperfResultHighlighter {
    private readonly decorations: vscode.TextEditorDecorationType[] = [];

    constructor(
        private readonly selectedRun: ObservableSelection<SampleFile>,
        private readonly vscodeWindow: TextEditorHandler = new TextEditorHandlerImpl(),
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

    private clearHighlights() {
        this.decorations.forEach(highlight => highlight.dispose());
        this.decorations.splice(0, this.decorations.length);
    }

    private addEditorHighlights(editor: vscode.TextEditor, sampleFile: SampleFile) {
        const decorations = calculateDecorations(sampleFile, editor.document.fileName);
        for (const decoration of decorations) {
            const decorationType = this.vscodeWindow.createTextEditorDecorationType({
                backgroundColor: decoration.backgroundColor,
                overviewRulerColor: decoration.backgroundColor,
            });
            this.decorations.push(decorationType);
            editor.setDecorations(decorationType, [
                {
                    range: editor.document.lineAt(decoration.line_number - 1).range,
                    hoverMessage: new vscode.MarkdownString(decoration.hoverMessage),
                }
            ]);
        }
    }
}

export type Decoration = SourceCode & {
    backgroundColor: string
    hoverMessage: string
};

export const calculateDecorations = (sample: SampleFile, fileName: string): Decoration[] => {
    const highlights: Decoration[] = [];
    for (const event of sample.parsedContent.sampling.events) {
        for (const annotation of event.annotate) {
            for (const sourceCode of annotation.source_code) {
                if (sourceCode.filename === fileName) {
                    highlights.push(buildDecoration(event, annotation, sourceCode));
                }
            }
        }
    }
    return highlights;
};

export const buildDecoration = (
    event: Event,
    annotation: Annotation,
    sourceCode: SourceCode
): Decoration => ({
    ...sourceCode,
    backgroundColor: backgroundColor(sourceCode.hits),
    hoverMessage: renderHoverMessage(event, annotation, sourceCode),
});

const renderHoverMessage = (
    event: Event,
    annotation: Annotation,
    sourceCode: SourceCode
): string => {
    return `
### WindowsPerf
* Event: ${event.type}
* Function: ${annotation.function_name}
* Hits: ${sourceCode.hits.toString()}

#### Disassembly
${'```'}
${renderDisassembly(sourceCode)}
${'```'}
`;
};

const renderDisassembly = (sourceCode: SourceCode): string => {
    return sourceCode.disassembled_line.disassemble.map(line => {
        const marker = line.address === sourceCode.instruction_address
            ? '<-'
            : '  ';
        return `${line.address} ${marker} | ${line.instruction}`;
    }).join('\n');
};

const backgroundColor = (hits: number): string => {
    if (hits > 50) {
        return 'rgba(255, 0, 0, 0.2)';
    }
    if (hits > 10) {
        return 'rgba(255, 255, 0, 0.2)';
    }
    return 'rgba(100, 100, 100, 0.2)';
};
