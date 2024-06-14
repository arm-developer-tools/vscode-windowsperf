/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { faker } from '@faker-js/faker';
import {
    TreeDataProvider,
    buildEventSampleNode,
    buildEventNode,
    buildSampleFileRootNode,
    buildSourceCodeNode,
    buildRecordRunRootNode,
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

describe('TreeDataProvider', () => {
    describe('getChildren', () => {
        it('returns root nodes by default', () => {
            const sampleFile = sampleFileFactory();
            const recordRun = recordRunFactory();
            const samples = new ObservableCollection([sampleFile]);
            const commands = new ObservableCollection([recordRun]);
            const treeDataProvider = new TreeDataProvider(
                samples,
                commands,
                new ObservableSelection(),
            );

            const got = treeDataProvider.getChildren();

            const wantIsSelected = false;
            const wantFiles = [buildSampleFileRootNode(sampleFile, wantIsSelected)];
            const wantCommands = [buildRecordRunRootNode(recordRun, wantIsSelected)];
            // To-Do: Should not concat but instead should arrange tree that last run appears at the top of the tree.
            expect(got).toEqual(wantCommands.concat(wantFiles));
        });

        it('root nodes are correctly marked as selected', () => {
            const sampleFile = sampleFileFactory();
            const samples = new ObservableCollection([sampleFile]);
            const selectedSample = new ObservableSelection(sampleFile);
            const treeDataProvider = new TreeDataProvider(
                samples,
                new ObservableCollection(),
                selectedSample,
            );

            const got = treeDataProvider.getChildren();

            const wantIsSelected = true;
            const want = [buildSampleFileRootNode(sampleFile, wantIsSelected)];
            expect(got).toEqual(want);
        });

        it('returns children of the given node', () => {
            const treeDataProvider = new TreeDataProvider(
                new ObservableCollection(),
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
                new ObservableCollection(),
                new ObservableSelection(),
            );
            const node = { label: 'foo' };

            const got = treeDataProvider.getTreeItem(node);

            expect(got).toEqual(node);
        });
    });
});

describe('buildSampleFileRootNode', () => {
    it('calculates children nodes', () => {
        const first = eventFactory();
        const second = eventFactory();
        const sampleFile = sampleFileFactory({
            parsedContent: sampleFactory({ events: [first, second] }),
        });

        const got = buildSampleFileRootNode(sampleFile, faker.datatype.boolean());

        const want = [buildEventNode(first), buildEventNode(second)];
        expect(got.children).toEqual(want);
    });

    it('sets label to display name', () => {
        const sampleFile = sampleFileFactory();

        const got = buildSampleFileRootNode(sampleFile, faker.datatype.boolean());

        expect(got.label).toEqual(sampleFile.displayName);
    });

    it('sets id', () => {
        const sampleFile = sampleFileFactory();

        const got = buildSampleFileRootNode(sampleFile, faker.datatype.boolean());

        expect(got.id).toEqual(sampleFile.id);
    });

    describe('selected state', () => {
        it('displays an icon indicating node is active', () => {
            const isSelected = true;

            const got = buildSampleFileRootNode(sampleFileFactory(), isSelected);

            const want = new vscode.ThemeIcon('eye', new vscode.ThemeColor('list.focusOutline'));
            expect(got.iconPath).toEqual(want);
        });

        it('sets "selected" context value when node is selected', () => {
            const isSelected = true;

            const got = buildSampleFileRootNode(sampleFileFactory(), isSelected);

            expect(got.contextValue).toEqual('rootNode--selected');
        });

        it('does an icon indicating node is not selected', () => {
            const isSelected = false;

            const got = buildSampleFileRootNode(sampleFileFactory(), isSelected);

            const want = new vscode.ThemeIcon(
                'eye-closed',
                new vscode.ThemeColor('list.deemphasizedForeground'),
            );
            expect(got.iconPath).toEqual(want);
        });

        it('does not set "selected" context value when node is not active', () => {
            const isSelected = false;

            const got = buildSampleFileRootNode(sampleFileFactory(), isSelected);

            expect(got.contextValue).toEqual('rootNode');
        });
    });
});

describe('buildrecordRunRootNode', () => {
    it('calculates children nodes', () => {
        const first = eventFactory();
        const second = eventFactory();
        const recordRun = recordRunFactory({
            parsedContent: sampleFactory({ events: [first, second] }),
        });

        const got = buildRecordRunRootNode(recordRun, faker.datatype.boolean());

        const want = [buildEventNode(first), buildEventNode(second)];
        expect(got.children).toEqual(want);
    });

    it('sets label to display name', () => {
        const recordRun = recordRunFactory();

        const got = buildRecordRunRootNode(recordRun, faker.datatype.boolean());

        expect(got.label).toEqual(recordRun.displayName);
    });

    it('sets description to current date', () => {
        const dateTime = new Date(Date.now());
        const today = `Date: ${dateTime.getFullYear()}-${dateTime.getMonth() + 1}-${dateTime.getDate()} - ${dateTime.toTimeString()}`;
        const recordRun = recordRunFactory();

        const got = buildRecordRunRootNode(recordRun, faker.datatype.boolean());

        expect(got.description).toBe(today);
    });

    it('sets id', () => {
        const recordRun = recordRunFactory();

        const got = buildRecordRunRootNode(recordRun, faker.datatype.boolean());

        expect(got.id).toEqual(recordRun.id);
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
