/*
 * Copyright (c) 2024 Arm Limited
 */

import { ObservableSelection } from '../../observable-selection';
import { SampleFile } from '../sampling-results/sample-file';
import { annotationFactory, eventFactory, sampleFactory, sourceCodeFactory } from '../../wperf/parse.factories';
import { sampleFileFactory } from '../sampling-results/sample-file.factories';
import { EditorHighlighter, buildDecoration, calculateDecorations } from './editor-highlighter';

describe('EditorHighlighter', () => {
    it('applies decorations to currently selected sample', () => {
        const selectedFile = new ObservableSelection<SampleFile>();
        const decorator = {
            decorate: jest.fn(),
            dispose: jest.fn(),
        };

        new EditorHighlighter(selectedFile, decorator);
        const selectedSample = sampleFileFactory();
        selectedFile.selected = selectedSample;

        expect(decorator.decorate).toHaveBeenCalledWith(calculateDecorations(selectedSample));
    });

    it('clears decorations to when selection is cleared', () => {
        const selectedFile = new ObservableSelection<SampleFile>(sampleFileFactory());
        const decorator = {
            decorate: jest.fn(),
            dispose: jest.fn(),
        };

        new EditorHighlighter(selectedFile, decorator);
        selectedFile.selected = null;

        expect(decorator.decorate).toHaveBeenCalledWith([]);
    });

    describe('dispose', () => {
        it('disposes of decorator', () => {
            const selectedFile = new ObservableSelection<SampleFile>();
            const decorator = {
                decorate: jest.fn(),
                dispose: jest.fn(),
            };

            const highlighter = new EditorHighlighter(selectedFile, decorator);
            highlighter.dispose();

            expect(decorator.dispose).toHaveBeenCalled();
        });

        it('will not call highlight when selected sample changes', () => {
            const selectedFile = new ObservableSelection<SampleFile>();
            const decorator = {
                decorate: jest.fn(),
                dispose: jest.fn(),
            };

            const highlighter = new EditorHighlighter(selectedFile, decorator);
            highlighter.dispose();
            selectedFile.selected = sampleFileFactory();

            expect(decorator.decorate).not.toHaveBeenCalled();
        });
    });
});

describe('calculateDecorations', () => {
    it('returns decorations for all source code', () => {
        const sourceCodeA = sourceCodeFactory();
        const sourceCodeB = sourceCodeFactory();
        const annotation = annotationFactory({ source_code: [sourceCodeA, sourceCodeB] });
        const event = eventFactory({ annotate: [annotation] });
        const sampleFile = sampleFileFactory({
            parsedContent: sampleFactory({ events: [event] })
        });

        const got = calculateDecorations(sampleFile);

        const want = [
            buildDecoration(event, annotation, sourceCodeA),
            buildDecoration(event, annotation, sourceCodeB),
        ];
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
            expect(got).toContain(sourceCode.overhead.toString());
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
