/**
 * Copyright (C) 2024 Arm Limited
 */

import { buildSourceCodeUri } from './resource-uri';
import { TreeDataProvider, buildAnnotationNode, buildEventNode, buildRootNode, buildSourceCodeNode } from './tree-data-provider';
import { annotationFactory, eventFactory, sampleFactory, sourceCodeFactory } from '../../wperf/projected-types.factories';
import { sampleFileFactory } from './tree-data-provider.factories';
import { ObservableCollection } from '../../observable-collection';

describe('TreeDataProvider', () => {
    describe('getChildren', () => {
        it('returns root nodes by default', () => {
            const sampleFile = sampleFileFactory();
            const samples = new ObservableCollection([sampleFile]);
            const treeDataProvider = new TreeDataProvider(samples);

            const got = treeDataProvider.getChildren();

            const want = [buildRootNode(sampleFile)];
            expect(got).toEqual(want);
        });

        it('returns children of the given node', () => {
            const treeDataProvider = new TreeDataProvider(new ObservableCollection());
            const nodeWithChildren = { children: [ { label: 'some-label' } ] };

            const got = treeDataProvider.getChildren(nodeWithChildren);

            const want = nodeWithChildren.children;
            expect(got).toEqual(want);
        });

        it('returns empty list if node has no children', () => {
            const treeDataProvider = new TreeDataProvider(new ObservableCollection());
            const nodeWithoutChildren = {};

            const got = treeDataProvider.getChildren(nodeWithoutChildren);

            expect(got).toEqual([]);
        });
    });

    describe('getTreeItem', () => {
        it('returns given node as is', () => {
            const treeDataProvider = new TreeDataProvider(new ObservableCollection());
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

        const got = buildRootNode(sampleFile);

        const want = [ buildEventNode(first), buildEventNode(second) ];
        expect(got.children).toEqual(want);
    });

    it('sets non-empty node label', () => {
        const got = buildRootNode(sampleFileFactory());

        expect(got.label).not.toBeUndefined();
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
    it('sets node label to filename', () => {
        const sourceCode = sourceCodeFactory({ filename: 'some-file.c' });

        const got = buildSourceCodeNode(sourceCode);

        expect(got.label).toEqual('some-file.c');
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
});
