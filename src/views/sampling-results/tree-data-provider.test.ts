/**
 * Copyright (C) 2024 Arm Limited
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
import {
    annotationFactory,
    eventFactory,
    eventSampleFactory,
    sampleFactory,
    sourceCodeFactory,
} from '../../wperf/parse.factories';
import { ObservableCollection } from '../../observable-collection';
import { ObservableSelection } from '../../observable-selection';
import { MarkdownString, Uri } from 'vscode';
import { buildDecoration } from './source-code-decoration';
import { recordRunFactory } from './record-run.factories';
import {
    sampleSourceFactory,
    sampleSourceFileFactory,
    sampleSourceRunFactory,
} from './sample-source.factories';

describe('TreeDataProvider', () => {
    describe('getChildren', () => {
        it('returns root nodes by default with last collection appear in the tree first', () => {
            const sampleSourceFile = sampleSourceFileFactory();
            const sampleRecordRun = sampleSourceFileFactory();
            const collections = new ObservableCollection([sampleSourceFile, sampleRecordRun]);
            const treeDataProvider = new TreeDataProvider(collections, new ObservableSelection());

            const got = treeDataProvider.getChildren();

            const wantIsSelected = false;
            const wantFiles = [buildSampleSourceRootNode(sampleSourceFile, wantIsSelected)];
            const wantCommands = [buildSampleSourceRootNode(sampleRecordRun, wantIsSelected)];
            expect(got).toEqual([...wantCommands, ...wantFiles]);
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
        const sampleFile = sampleFileFactory({
            parsedContent: sampleFactory({ events: [first, second] }),
        });
        const sampleSourceFile = sampleSourceFileFactory({
            result: sampleFile,
        });

        const got = buildSampleSourceRootNode(sampleSourceFile, faker.datatype.boolean());

        const want = [buildEventNode(first), buildEventNode(second)];
        expect(got.children).toEqual(want);
    });

    describe('given sample sourced from a file', () => {
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
    });

    describe('given sample sourced from a record run', () => {
        it('sets label to display name', () => {
            const sampleSourceFile = sampleSourceRunFactory();

            const got = buildSampleSourceRootNode(sampleSourceFile, faker.datatype.boolean());

            expect(got.label).toEqual(sampleSourceFile.context.result.displayName);
        });

        it('sets description to current date', () => {
            const record = recordRunFactory();
            const sampleSourceFile = sampleSourceRunFactory({ result: record });

            const got = buildSampleSourceRootNode(sampleSourceFile, faker.datatype.boolean());

            expect(got.description).toEqual(record.date);
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

            expect(got.contextValue).toEqual('rootNode--selected');
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

            expect(got.contextValue).toEqual('rootNode');
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

        const got = buildEventNode(event);

        const want = [
            buildEventSampleNode(event, sampleWithMatchingAnnotation, matchingAnnotation),
            buildEventSampleNode(event, otherSample, undefined),
        ];
        expect(got.children).toEqual(want);
    });

    it('sets node label to event type', () => {
        const event = eventFactory({ type: 'a-type' });

        const got = buildEventNode(event);

        expect(got.label).toEqual('a-type');
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
    it('sets node label to filename and line number', () => {
        const sourceCode = sourceCodeFactory({
            filename: 'some-file.c',
            line_number: 99,
        });

        const got = buildSourceCodeNode(eventFactory(), annotationFactory(), sourceCode);

        expect(got.label).toEqual('some-file.c:99');
    });

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

        const want = new MarkdownString(
            buildDecoration(event, annotation, sourceCode).hoverMessage,
        );
        expect(got).toEqual(want);
    });
});
