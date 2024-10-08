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
import { faker } from '@faker-js/faker';
import {
    TreeDataProvider,
    buildEventSampleNode,
    buildEventNode,
    buildSourceCodeNode,
    buildSampleSourceRootNode,
} from './tree-data-provider';
import { sampleFileFactory } from './sample-file.factories';
import { ObservableCollection } from '../../observable-collection';
import { ObservableSelection } from '../../observable-selection';
import { MarkdownString, Uri } from 'vscode';
import { recordRunFactory } from './record-run.factories';
import {
    sampleSourceFactory,
    sampleSourceFileFactory,
    sampleSourceRunFactory,
} from './sample-source.factories';
import {
    annotationFactory,
    eventFactory,
    eventSampleFactory,
    sourceCodeFactory,
} from '../../wperf/parse/record.factories';
import { basename } from 'path';
import { renderTreeHoverMessage } from './source-code-decoration';
import {
    eventAndFrequencyFactory,
    recordOptionsFactory,
} from '../../wperf/record-options.factories';

describe('TreeDataProvider', () => {
    describe('getChildren', () => {
        it('returns root nodes by default', () => {
            const sampleSourceFile = sampleSourceFileFactory();
            const sampleRecordRun = sampleSourceFileFactory();
            const collections = new ObservableCollection([sampleSourceFile, sampleRecordRun]);
            const treeDataProvider = new TreeDataProvider(collections, new ObservableSelection());

            const got = treeDataProvider.getChildren();

            const wantIsSelected = false;
            const want = [
                buildSampleSourceRootNode(sampleSourceFile, wantIsSelected),
                buildSampleSourceRootNode(sampleRecordRun, wantIsSelected),
            ];
            expect(got).toEqual(want);
        });

        it('root nodes are correctly marked as selected', () => {
            const sourceFile = sampleSourceFileFactory();
            const collections = new ObservableCollection([sourceFile]);
            const selectedSample = new ObservableSelection(sourceFile);
            const treeDataProvider = new TreeDataProvider(collections, selectedSample);

            const got = treeDataProvider.getChildren();

            const wantIsSelected = true;
            const want = [buildSampleSourceRootNode(sourceFile, wantIsSelected)];
            expect(got).toEqual(want);
        });

        it('returns children of the given node', () => {
            const treeDataProvider = new TreeDataProvider(
                new ObservableCollection(),
                new ObservableSelection(),
            );
            const nodeWithChildren = { children: [{ label: 'some-label' }] };

            const got = treeDataProvider.getChildren(nodeWithChildren);

            const want = nodeWithChildren.children;
            expect(got).toEqual(want);
        });

        it('returns empty list if node has no children', () => {
            const treeDataProvider = new TreeDataProvider(
                new ObservableCollection(),
                new ObservableSelection(),
            );
            const nodeWithoutChildren = {};

            const got = treeDataProvider.getChildren(nodeWithoutChildren);

            expect(got).toEqual([]);
        });
    });

    describe('getTreeItem', () => {
        it('returns given node as is', () => {
            const treeDataProvider = new TreeDataProvider(
                new ObservableCollection(),
                new ObservableSelection(),
            );
            const node = { label: 'foo' };

            const got = treeDataProvider.getTreeItem(node);

            expect(got).toEqual(node);
        });
    });
});

describe('buildSampleSourceRootNode', () => {
    it('sets id', () => {
        const sampleSource = sampleSourceFactory();

        const got = buildSampleSourceRootNode(sampleSource, faker.datatype.boolean());

        expect(got.id).toEqual(sampleSource.id);
    });

    it('calculates children nodes', () => {
        const first = eventFactory();
        const second = eventFactory();
        const sampleTotal = first.count + second.count;
        const sampleFile = sampleFileFactory({
            parsedContent: { events: [first, second], totalCount: sampleTotal },
        });
        const sampleSourceFile = sampleSourceFileFactory({
            result: sampleFile,
        });

        const got = buildSampleSourceRootNode(sampleSourceFile, faker.datatype.boolean());

        const want = [buildEventNode(first, sampleTotal), buildEventNode(second, sampleTotal)];
        expect(got.children).toEqual(want);
    });

    describe('given sample sourced from a file', () => {
        it('calculates children nodes', () => {
            const first = eventFactory();
            const second = eventFactory();
            const sampleTotal = first.count + second.count;
            const sampleFile = sampleFileFactory({
                parsedContent: { events: [first, second], totalCount: sampleTotal },
            });
            const sampleSourceFile = sampleSourceFileFactory({
                result: sampleFile,
            });

            const got = buildSampleSourceRootNode(sampleSourceFile, faker.datatype.boolean());

            const want = [buildEventNode(first, sampleTotal), buildEventNode(second, sampleTotal)];
            expect(got.children).toEqual(want);
        });

        it('sets label to display name', () => {
            const sampleSourceFile = sampleSourceFileFactory();

            const got = buildSampleSourceRootNode(sampleSourceFile, faker.datatype.boolean());

            expect(got.label).toEqual(sampleSourceFile.context.result.displayName);
        });

        it('sets resource uri to file uri', () => {
            const sampleFile = sampleFileFactory();
            const sampleSourceFile = sampleSourceFileFactory({ result: sampleFile });

            const got = buildSampleSourceRootNode(sampleSourceFile, faker.datatype.boolean());

            expect(got.resourceUri).toEqual(sampleFile.uri);
        });

        it('sets the context value', () => {
            const sampleFile = sampleFileFactory();
            const sampleSourceFile = sampleSourceFileFactory({ result: sampleFile });
            const selected = false;

            const got = buildSampleSourceRootNode(sampleSourceFile, selected);

            expect(got.contextValue).toEqual(sampleFile.treeContextName);
        });
    });

    describe('given sample sourced from a record run', () => {
        it('returns empty children property when there are only unknown events types whilst recording', () => {
            const event = eventFactory({
                type: 'unknown event',
                samples: [],
                annotate: [],
            });
            const sampleFile = recordRunFactory({
                parsedContent: { events: [event], totalCount: 100 },
                recordOptions: recordOptionsFactory({
                    events: [eventAndFrequencyFactory()],
                }),
            });
            const sampleSourceFile = sampleSourceRunFactory({
                result: sampleFile,
            });

            const got = buildSampleSourceRootNode(sampleSourceFile, faker.datatype.boolean());

            expect(got.children).toEqual([]);
        });

        it('returns only the children that have known event types when recording', () => {
            const eventUnknown = eventFactory({
                type: 'unknown event',
                samples: [],
                annotate: [],
                count: 0,
            });
            const eventKnownSample = eventSampleFactory();
            const eventKnown = eventFactory({
                samples: [eventKnownSample],
            });
            const sampleFile = recordRunFactory({
                parsedContent: {
                    events: [eventUnknown, eventKnown],
                    totalCount: eventKnown.count + eventUnknown.count,
                },
                recordOptions: recordOptionsFactory({
                    events: [eventAndFrequencyFactory()],
                }),
            });
            const sampleSourceFile = sampleSourceRunFactory({
                result: sampleFile,
            });

            const got = buildSampleSourceRootNode(sampleSourceFile, faker.datatype.boolean());
            const want = [buildEventNode(eventKnown, eventKnown.count)];
            expect(got.children).toEqual(want);
        });

        it('sets label to display name', () => {
            const sampleSourceFile = sampleSourceRunFactory();

            const got = buildSampleSourceRootNode(sampleSourceFile, faker.datatype.boolean());

            expect(got.label).toEqual(sampleSourceFile.context.result.displayName);
        });

        it('sets description to current date', () => {
            const record = recordRunFactory();
            const sampleSourceFile = sampleSourceRunFactory({ result: record });

            const got = buildSampleSourceRootNode(sampleSourceFile, faker.datatype.boolean());

            expect(got.description).toEqual(
                `${record.date} (hits: ${sampleSourceFile.context.result.parsedContent.totalCount})`,
            );
        });

        it('sets the context value', () => {
            const record = recordRunFactory();
            const sampleSourceFile = sampleSourceRunFactory({ result: record });
            const selected = false;

            const got = buildSampleSourceRootNode(sampleSourceFile, selected);

            expect(got.contextValue).toEqual(record.treeContextName);
        });
    });

    describe('selected state', () => {
        it('displays an icon indicating node is active', () => {
            const isSelected = true;

            const got = buildSampleSourceRootNode(sampleSourceFileFactory(), isSelected);

            const want = new vscode.ThemeIcon('eye', new vscode.ThemeColor('list.focusOutline'));
            expect(got.iconPath).toEqual(want);
        });

        it('sets "selected" context value when node is selected', () => {
            const isSelected = true;

            const got = buildSampleSourceRootNode(sampleSourceFileFactory(), isSelected);

            expect(got.contextValue).toEqual('sampleFile--selected');
        });

        it('does an icon indicating node is not selected', () => {
            const isSelected = false;

            const got = buildSampleSourceRootNode(sampleSourceFileFactory(), isSelected);

            const want = new vscode.ThemeIcon(
                'eye-closed',
                new vscode.ThemeColor('list.deemphasizedForeground'),
            );
            expect(got.iconPath).toEqual(want);
        });

        it('does not set "selected" context value when node is not active', () => {
            const isSelected = false;

            const got = buildSampleSourceRootNode(sampleSourceFileFactory(), isSelected);

            expect(got.contextValue).toEqual('sampleFile');
        });
    });
});

describe('buildEventNode', () => {
    it('calculates child nodes for all samples with matching annotations', () => {
        const sampleWithMatchingAnnotation = eventSampleFactory({
            symbol: 'a-function',
        });
        const otherSample = eventSampleFactory();
        const matchingAnnotation = annotationFactory({
            function_name: 'a-function',
        });
        const event = eventFactory({
            samples: [sampleWithMatchingAnnotation, otherSample],
            annotate: [matchingAnnotation, annotationFactory()],
        });

        const got = buildEventNode(event, 100);

        const want = [
            buildEventSampleNode(event, sampleWithMatchingAnnotation, matchingAnnotation),
            buildEventSampleNode(event, otherSample, undefined),
        ];
        expect(got!.children).toEqual(want);
    });

    it('sets node label to event type', () => {
        const event = eventFactory({ type: 'a-type' });

        const got = buildEventNode(event, 100);

        expect(got!.label).toEqual('a-type');
    });
});

describe('buildEventSampleNode', () => {
    it('calculates child nodes for each source code', () => {
        const first = sourceCodeFactory();
        const second = sourceCodeFactory();
        const event = eventFactory();
        const annotation = annotationFactory({ source_code: [first, second] });

        const got = buildEventSampleNode(event, eventSampleFactory(), annotation);

        const want = [
            buildSourceCodeNode(event, annotation, first),
            buildSourceCodeNode(event, annotation, second),
        ];
        expect(got.children).toEqual(want);
        expect(got.collapsibleState).toEqual(vscode.TreeItemCollapsibleState.Collapsed);
    });

    it('makes node not expandable given no source code', () => {
        const got = buildEventSampleNode(eventFactory(), eventSampleFactory(), undefined);

        expect(got.children).toEqual([]);
        expect(got.collapsibleState).toEqual(vscode.TreeItemCollapsibleState.None);
    });

    it('sets node label to symbol name', () => {
        const eventSample = eventSampleFactory({ symbol: 'a-nice-symbol' });

        const got = buildEventSampleNode(eventFactory(), eventSample, annotationFactory());

        expect(got.label).toEqual('a-nice-symbol');
    });

    it('decorates node with count and overhead', () => {
        const eventSample = eventSampleFactory({ count: 5, overhead: 12.1031 });

        const got = buildEventSampleNode(eventFactory(), eventSample, annotationFactory());

        expect(got.description).toContain('hits: 5');
        expect(got.description).toContain('12.1%');
    });
});

describe('buildSourceNode', () => {
    it('decorates node with hits and overhead', () => {
        const sourceCode = sourceCodeFactory({ hits: 5, overhead: 22.22576 });

        const got = buildSourceCodeNode(eventFactory(), annotationFactory(), sourceCode);

        expect(got.description).toContain('hits: 5');
        expect(got.description).toContain('22.23%');
    });

    it('sets command to open the source code', () => {
        const sourceCode = sourceCodeFactory();

        const got = buildSourceCodeNode(eventFactory(), annotationFactory(), sourceCode).command;

        const want = {
            command: 'vscode.open',
            title: 'Open File',
            arguments: [Uri.parse(`file://${sourceCode.filename}#${sourceCode.line_number}`)],
        };
        expect(got).toEqual(want);
    });

    it('sets tooltip to hover message', () => {
        const sourceCode = sourceCodeFactory();
        const event = eventFactory();
        const annotation = annotationFactory();

        const got = buildSourceCodeNode(event, annotation, sourceCode).tooltip;

        const want = new MarkdownString(renderTreeHoverMessage(event, annotation, sourceCode));
        expect(got).toEqual(want);
    });

    it('sets truncated filename and line number', () => {
        const sourceCode = sourceCodeFactory({
            line_number: 99,
        });

        const got = buildSourceCodeNode(eventFactory(), annotationFactory(), sourceCode);

        const want = `${basename(sourceCode.filename)}:99`;
        expect(got.label).toEqual(want);
    });
});
