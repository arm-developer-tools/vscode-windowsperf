/*
 * Copyright (c) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { ObservableSelection } from '../../observable-selection';
import { createTextEditorDecorationTypeFactory, textEditorHandlerFactory, vscodeTextDocumentFactory, vscodeTextEditorFactory } from '../../vscode-api/text-editor.factory';
import { SampleFile } from '../sampling-results/sample-file';
import { annotationFactory, eventFactory, sampleFactory, sourceCodeFactory } from '../../wperf/projected-types.factories';
import { sampleFileFactory } from '../sampling-results/sample-file.factories';
import { WperfResultHighlighter } from './WperfResultHighlighter';

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
