/*
 * Copyright (c) 2024 Arm Limited
 */

import { ObservableSelection } from '../../observable-selection';
import { sampleFileFactory } from '../sampling-results/sample-file.factories';
import { EditorHighlighter, calculateDecorations } from './editor-highlighter';
import { buildDecoration } from './source-code-decoration';
import { sampleSourceFileFactory } from './sample-source.factories';
import { SampleSource } from './sample-source';
import {
    annotationFactory,
    eventFactory,
    sourceCodeFactory,
} from '../../wperf/parse/record.factories';
import { SourceCode } from '../../wperf/parse/record';

describe('EditorHighlighter', () => {
    it('applies decorations to currently selected sample', () => {
        const selectedFile = new ObservableSelection<SampleSource>();
        const decorator = {
            decorate: jest.fn(),
            dispose: jest.fn(),
        };

        new EditorHighlighter(selectedFile, decorator);
        const selectedSample = sampleSourceFileFactory();
        selectedFile.selected = selectedSample;
        expect(decorator.decorate).toHaveBeenCalledWith(
            calculateDecorations(selectedSample.context.result.parsedContent),
        );
    });

    it('clears decorations to when selection is cleared', () => {
        const selectedFile = new ObservableSelection<SampleSource>(sampleSourceFileFactory());
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
            const selectedFile = new ObservableSelection<SampleSource>();
            const decorator = {
                decorate: jest.fn(),
                dispose: jest.fn(),
            };

            const highlighter = new EditorHighlighter(selectedFile, decorator);
            highlighter.dispose();

            expect(decorator.dispose).toHaveBeenCalled();
        });

        it('will not call highlight when selected sample changes', () => {
            const selectedFile = new ObservableSelection<SampleSource>();
            const decorator = {
                decorate: jest.fn(),
                dispose: jest.fn(),
            };

            const highlighter = new EditorHighlighter(selectedFile, decorator);
            highlighter.dispose();
            const sampleSource = sampleSourceFileFactory();
            selectedFile.selected = sampleSource;

            expect(decorator.decorate).not.toHaveBeenCalled();
        });
    });
});

describe('calculateDecorations', () => {
    it('returns decorations for non duplicate values', () => {
        const sourceCodeA = sourceCodeFactory({ hits: 10 });
        const sourceCodeB = sourceCodeFactory({ hits: 40 });
        const annotation = annotationFactory({
            source_code: [sourceCodeA, sourceCodeB],
        });
        const event = eventFactory({ annotate: [annotation] });
        const sampleFile = sampleFileFactory({
            parsedContent: [event],
        });

        const got = calculateDecorations(
            sampleSourceFileFactory({ result: sampleFile }).context.result.parsedContent,
        );

        const want = [
            buildDecoration({
                filename: sourceCodeA.filename,
                lineNumber: sourceCodeA.line_number,
                content: [
                    {
                        eventType: event.type,
                        functionName: annotation.function_name,
                        sourceCode: sourceCodeA,
                    },
                ],
                lineHits: 10,
                totalFileHits: 10,
            }),
            buildDecoration({
                filename: sourceCodeB.filename,
                lineNumber: sourceCodeB.line_number,
                content: [
                    {
                        eventType: event.type,
                        functionName: annotation.function_name,
                        sourceCode: sourceCodeB,
                    },
                ],
                lineHits: 40,
                totalFileHits: 40,
            }),
        ];
        expect(got).toEqual(want);
    });

    it('combines same line different file into a merged decoration', () => {
        const mockOne: Partial<SourceCode> = {
            filename: 'mock-filename-1',
            line_number: 1,
            hits: 5,
        };
        const mockTwo: Partial<SourceCode> = {
            filename: 'mock-filename-2',
            line_number: 3,
            hits: 7,
        };
        const sourceCodeA = sourceCodeFactory(mockOne);
        const sourceCodeB = sourceCodeFactory(mockTwo);
        const sourceCodeADup = sourceCodeFactory(mockOne);
        const sourceCodeBDup = sourceCodeFactory(mockTwo);
        const annotation = annotationFactory({
            source_code: [sourceCodeA, sourceCodeB, sourceCodeADup, sourceCodeBDup],
        });
        const event = eventFactory({ annotate: [annotation] });
        const sampleFile = sampleFileFactory({
            parsedContent: [event],
        });

        const got = calculateDecorations(
            sampleSourceFileFactory({ result: sampleFile }).context.result.parsedContent,
        );

        const want = [
            buildDecoration({
                filename: sourceCodeA.filename,
                lineNumber: sourceCodeA.line_number,
                content: [
                    {
                        eventType: event.type,
                        functionName: annotation.function_name,
                        sourceCode: sourceCodeA,
                    },
                    {
                        eventType: event.type,
                        functionName: annotation.function_name,
                        sourceCode: sourceCodeADup,
                    },
                ],
                lineHits: 10,
                totalFileHits: 10,
            }),
            buildDecoration({
                filename: sourceCodeB.filename,
                lineNumber: sourceCodeB.line_number,
                content: [
                    {
                        eventType: event.type,
                        functionName: annotation.function_name,
                        sourceCode: sourceCodeB,
                    },
                    {
                        eventType: event.type,
                        functionName: annotation.function_name,
                        sourceCode: sourceCodeBDup,
                    },
                ],
                lineHits: 14,
                totalFileHits: 14,
            }),
        ];
        expect(got).toEqual(want);
    });

    it('combine same line and same file into a merged decoration', () => {
        const sourceCodeA = sourceCodeFactory({ filename: 'test-file', line_number: 2, hits: 100 });
        const sourceCodeB = sourceCodeFactory({ filename: 'test-file', line_number: 2, hits: 200 });
        const annotation = annotationFactory({
            source_code: [sourceCodeA, sourceCodeB],
        });
        const event = eventFactory({ annotate: [annotation] });
        const sampleFile = sampleFileFactory({
            parsedContent: [event],
        });

        const got = calculateDecorations(
            sampleSourceFileFactory({ result: sampleFile }).context.result.parsedContent,
        );

        const want = [
            buildDecoration({
                filename: sourceCodeA.filename,
                lineNumber: sourceCodeA.line_number,
                content: [
                    {
                        eventType: event.type,
                        functionName: annotation.function_name,
                        sourceCode: sourceCodeA,
                    },
                    {
                        eventType: event.type,
                        functionName: annotation.function_name,
                        sourceCode: sourceCodeB,
                    },
                ],
                lineHits: sourceCodeA.hits + sourceCodeB.hits,
                totalFileHits: 300,
            }),
        ];
        expect(got).toEqual(want);
    });

    it('returns correct percentages based on multiple merged files', () => {
        const sourceCodeA = sourceCodeFactory({ filename: 'test-file', line_number: 2, hits: 25 });
        const sourceCodeB = sourceCodeFactory({ filename: 'test-file', line_number: 2, hits: 75 });
        const annotation = annotationFactory({ source_code: [sourceCodeA, sourceCodeB] });

        const sourceCodeC = sourceCodeFactory({ filename: 'test-file', line_number: 4, hits: 100 });
        const annotationB = annotationFactory({ source_code: [sourceCodeC] });

        const event = eventFactory({ annotate: [annotation] });
        const eventB = eventFactory({ annotate: [annotationB] });
        const sampleFile = sampleFileFactory({ parsedContent: [event, eventB] });

        const got = calculateDecorations(
            sampleSourceFileFactory({ result: sampleFile }).context.result.parsedContent,
        );

        const want = [
            buildDecoration({
                filename: sourceCodeA.filename,
                lineNumber: sourceCodeA.line_number,
                content: [
                    {
                        eventType: event.type,
                        functionName: annotation.function_name,
                        sourceCode: sourceCodeA,
                    },
                    {
                        eventType: event.type,
                        functionName: annotation.function_name,
                        sourceCode: sourceCodeB,
                    },
                ],
                lineHits: sourceCodeA.hits + sourceCodeB.hits,
                totalFileHits: 200,
            }),
            buildDecoration({
                filename: sourceCodeC.filename,
                lineNumber: sourceCodeC.line_number,
                content: [
                    {
                        eventType: eventB.type,
                        functionName: annotationB.function_name,
                        sourceCode: sourceCodeC,
                    },
                ],
                lineHits: sourceCodeC.hits,
                totalFileHits: 200,
            }),
        ];
        expect(got).toEqual(want);
    });
});
