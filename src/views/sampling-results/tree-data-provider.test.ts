/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import { faker } from '@faker-js/faker';

import { TreeDataProvider, buildAnnotationNode, buildEventNode, buildRootNode, buildSourceCodeNode } from './tree-data-provider';
import { buildSourceCodeUri } from './resource-uri';
import { sampleFileFactory } from './sample-file.factories';
import { annotationFactory, eventFactory, sampleFactory, sourceCodeFactory } from '../../wperf/projected-types.factories';
import { ObservableCollection } from '../../observable-collection';
import { ObservableSelection } from '../../observable-selection';

describe('TreeDataProvider', () => {
    describe('getChildren', () => {
        it('returns root nodes by default', () => {
            const sampleFile = sampleFileFactory();
            const samples = new ObservableCollection([sampleFile]);
            const treeDataProvider = new TreeDataProvider(samples, new ObservableSelection());

            const got = treeDataProvider.getChildren();

            const wantIsSelected = false;
            const want = [buildRootNode(sampleFile, wantIsSelected)];
            expect(got).toEqual(want);
        });

        it('root nodes are correctly marked as selected', () => {
            const sampleFile = sampleFileFactory();
            const samples = new ObservableCollection([sampleFile]);
            const selectedSample = new ObservableSelection(sampleFile);
            const treeDataProvider = new TreeDataProvider(samples, selectedSample);

            const got = treeDataProvider.getChildren();

            const wantIsSelected = true;
            const want = [buildRootNode(sampleFile, wantIsSelected)];
            expect(got).toEqual(want);
        });

        it('returns children of the given node', () => {
            const treeDataProvider = new TreeDataProvider(
                new ObservableCollection(), new ObservableSelection(),
            );
            const nodeWithChildren = { children: [ { label: 'some-label' } ] };

            const got = treeDataProvider.getChildren(nodeWithChildren);

            const want = nodeWithChildren.children;
            expect(got).toEqual(want);
        });

        it('returns empty list if node has no children', () => {
            const treeDataProvider = new TreeDataProvider(
                new ObservableCollection(), new ObservableSelection(),
            );
            const nodeWithoutChildren = {};

            const got = treeDataProvider.getChildren(nodeWithoutChildren);

            expect(got).toEqual([]);
        });
    });

    describe('getTreeItem', () => {
        it('returns given node as is', () => {
            const treeDataProvider = new TreeDataProvider(
                new ObservableCollection(), new ObservableSelection(),
            );
            const node = { label: 'foo' };

            const got = treeDataProvider.getTreeItem(node);

            expect(got).toEqual(node);
        });
    });
});

describe('buildRootNode', () => {
    it('calculates children nodes', () => {
        const first = eventFactory();
        const second = eventFactory();
        const sampleFile = sampleFileFactory({
            parsedContent: sampleFactory({ events: [ first, second ] }),
        });

        const got = buildRootNode(sampleFile, faker.datatype.boolean());

        const want = [ buildEventNode(first), buildEventNode(second) ];
        expect(got.children).toEqual(want);
    });

    it('sets label to display name', () => {
        const sampleFile = sampleFileFactory();

        const got = buildRootNode(sampleFile, faker.datatype.boolean());

        expect(got.label).toEqual(sampleFile.displayName);
    });

    it('sets id', () => {
        const sampleFile = sampleFileFactory();

        const got = buildRootNode(sampleFile, faker.datatype.boolean());

        expect(got.id).toEqual(sampleFile.id);
    });

    describe('selected state', () => {
        it('displays an icon indicating node is active', () => {
            const isSelected = true;

            const got = buildRootNode(sampleFileFactory(), isSelected);

            const want = new vscode.ThemeIcon('eye', new vscode.ThemeColor('list.focusOutline'));
            expect(got.iconPath).toEqual(want);
        });

        it('sets "selected" context value when node is selected', () => {
            const isSelected = true;

            const got = buildRootNode(sampleFileFactory(), isSelected);

            expect(got.contextValue).toEqual('sampleFile--selected');
        });

        it('does an icon indicating node is not selected', () => {
            const isSelected = false;

            const got = buildRootNode(sampleFileFactory(), isSelected);

            const want = new vscode.ThemeIcon(
                'eye-closed', new vscode.ThemeColor('list.deemphasizedForeground'),
            );
            expect(got.iconPath).toEqual(want);
        });

        it('does not set "selected" context value when node is not active', () => {
            const isSelected = false;

            const got = buildRootNode(sampleFileFactory(), isSelected);

            expect(got.contextValue).toEqual('sampleFile');
        });
    });
});

describe('buildEventNode', () => {
    it('calculates children nodes', () => {
        const first = annotationFactory();
        const second = annotationFactory();
        const event = eventFactory({ annotate: [ first, second ] });

        const got = buildEventNode(event);

        const want = [ buildAnnotationNode(first), buildAnnotationNode(second) ];
        expect(got.children).toEqual(want);
    });

    it('sets node label to event type', () => {
        const event = eventFactory({ type: 'a-type' });

        const got = buildEventNode(event);

        expect(got.label).toEqual('a-type');
    });
});

describe('buildAnnotationNode', () => {
    it('calculates children nodes', () => {
        const first = sourceCodeFactory();
        const second = sourceCodeFactory();
        const annotation = annotationFactory({ source_code: [first, second], });

        const got = buildAnnotationNode(annotation);

        const want = [ buildSourceCodeNode(first), buildSourceCodeNode(second) ];
        expect(got.children).toEqual(want);
    });

    it('sets node label to function name', () => {
        const annotation = annotationFactory({ function_name: 'a-function' });

        const got = buildAnnotationNode(annotation);

        expect(got.label).toEqual('a-function');
    });
});

describe('buildSourceNode', () => {
    it('sets node label to filename and line number', () => {
        const sourceCode = sourceCodeFactory({ filename: 'some-file.c', line_number: 99 });

        const got = buildSourceCodeNode(sourceCode);

        expect(got.label).toEqual('some-file.c:99');
    });

    it('sets readable node description', () => {
        const sourceCode = sourceCodeFactory({ hits: 5 });

        const got = buildSourceCodeNode(sourceCode);

        const want = 'hits: 5';
        expect(got.description).toEqual(want);
    });

    it('sets resource uri', () => {
        const sourceCode = sourceCodeFactory();

        const got = buildSourceCodeNode(sourceCode);

        const want = buildSourceCodeUri(sourceCode);
        expect(got.resourceUri).toEqual(want);
    });

    it('sets command to open the source code', () => {
        const sourceCode = sourceCodeFactory();

        const got = buildSourceCodeNode(sourceCode).command;

        const want = {
            command: 'vscode.open',
            title: 'Open File',
            arguments: [vscode.Uri.parse(`file://${sourceCode.filename}#${sourceCode.line_number}`)]
        };
        expect(got).toEqual(want);
    });
});
