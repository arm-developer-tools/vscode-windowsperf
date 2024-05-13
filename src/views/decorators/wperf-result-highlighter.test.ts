/*
 * Copyright (c) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { ObservableSelection } from '../../observable-selection';
import { createTextEditorDecorationTypeFactory, textEditorHandlerFactory, vscodeTextDocumentFactory, vscodeTextEditorFactory } from '../../vscode-api/text-editor.factory';
import { SampleFile } from '../sampling-results/sample-file';
import { annotationFactory, eventFactory, sampleFactory, sourceCodeFactory } from '../../wperf/projected-types.factories';
import { sampleFileFactory } from '../sampling-results/sample-file.factories';
import { WperfResultHighlighter, buildDecoration, calculateDecorations } from './wperf-result-highlighter';

describe('HighlightWperfResultLines', () => {
    it('does nothing on construction', () => {
        const mockedTextEditor = textEditorHandlerFactory();
        const selected = new ObservableSelection<SampleFile>();

        new WperfResultHighlighter(selected, mockedTextEditor);

        expect(mockedTextEditor.createTextEditorDecorationType).not.toHaveBeenCalled();
    });

    it('creates a new editor decoration type when selection changes', () => {
        const mockedTextEditor = textEditorHandlerFactory();
        const uriEditorPath = vscode.Uri.file('boo-far.c');
        const event = eventFactory(
            { annotate: [annotationFactory(
                { source_code: [sourceCodeFactory(
                    { filename: uriEditorPath.fsPath })]
                })]
            }
        );

        const sampleFile = sampleFileFactory({ parsedContent: sampleFactory({ events: [event] }) });
        const selection = new ObservableSelection<SampleFile>();

        new WperfResultHighlighter(selection, mockedTextEditor);

        mockedTextEditor.getVisibleTextEditors.mockReturnValue([
            vscodeTextEditorFactory({ document: vscodeTextDocumentFactory({ uri: uriEditorPath }) })
        ]);
        selection.selected = sampleFile;

        expect(mockedTextEditor.getVisibleTextEditors).toHaveBeenCalledTimes(1);
        expect(mockedTextEditor.onDidChangeVisibleTextEditors).toHaveBeenCalledTimes(1);
        expect(mockedTextEditor.createTextEditorDecorationType).toHaveBeenCalledTimes(1);
    });

    it('disposes all current highlights when selection is updated', () => {
        const mockedTextEditor = textEditorHandlerFactory();
        const uriEditorPath = vscode.Uri.file('boo-far.c');
        const event = eventFactory(
            { annotate: [annotationFactory(
                { source_code: [sourceCodeFactory(
                    { filename: uriEditorPath.fsPath })]
                })]
            }
        );

        const sampleFile = sampleFileFactory({ parsedContent: sampleFactory({ events: [event] }) });
        const selection = new ObservableSelection<SampleFile>();

        new WperfResultHighlighter(selection, mockedTextEditor);

        mockedTextEditor.getVisibleTextEditors.mockReturnValue([
            vscodeTextEditorFactory({ document: vscodeTextDocumentFactory({ uri: uriEditorPath }) })
        ]);

        mockedTextEditor.createTextEditorDecorationType.mockImplementation(createTextEditorDecorationTypeFactory);

        selection.selected = sampleFile;

        const decoration = mockedTextEditor.createTextEditorDecorationType.mock.results[0].value;
        mockedTextEditor.getVisibleTextEditors.mockReturnValue([]);
        selection.selected = null;

        expect(decoration.dispose).toHaveBeenCalledTimes(1);
    });
});

describe('calculateDecorations', () => {
    it('returns decorations for all source code with matching filename', () => {
        const sourceCode = sourceCodeFactory();
        const annotation = annotationFactory({ source_code: [sourceCode, sourceCodeFactory()] });
        const event = eventFactory({ annotate: [annotation, annotationFactory()] });
        const sampleFile = sampleFileFactory({
            parsedContent: sampleFactory({ events: [event, eventFactory()] })
        });

        const got = calculateDecorations(sampleFile, sourceCode.filename);

        const want = [buildDecoration(event, annotation, sourceCode)];
        expect(got).toEqual(want);
    });
});

describe('buildDecoration', () => {
    describe('hover message', () => {
        it('describes the decorated event', () => {
            const event = eventFactory();
            const annotation = annotationFactory();
            const sourceCode = sourceCodeFactory();

            const got = buildDecoration(event, annotation, sourceCode).hoverMessage;

            expect(got).toContain(event.type);
            expect(got).toContain(annotation.function_name);
            expect(got).toContain(sourceCode.hits.toString());
        });

        it('contains the disassembly', () => {
            const sourceCode = sourceCodeFactory();

            const got = buildDecoration(
                eventFactory(),
                annotationFactory(),
                sourceCode,
            ).hoverMessage;

            for (const line of sourceCode.disassembled_line.disassemble) {
                expect(got).toContain(line.address);
                expect(got).toContain(line.instruction);
            }
        });
    });
});
