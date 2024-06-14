/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { Annotation, Event, EventSample, SourceCode } from '../../wperf/parse';
import { ObservableCollection } from '../../observable-collection';
import { ObservableSelection } from '../../observable-selection';
import { formatFraction } from '../../math';
import { buildDecoration } from './source-code-decoration';
import { Uri } from 'vscode';
import { logger } from '../../logging/logger';
import { SampleSource, isSourceSampleFile } from './sample-source';
import { SampleFile } from './sample-file';
import { RecordRun } from './record-run';

type Node = vscode.TreeItem & { children?: Node[] };

export class TreeDataProvider implements vscode.TreeDataProvider<Node> {
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(
        private readonly collection: ObservableCollection<SampleSource>,
        private readonly selectedSample: ObservableSelection<SampleSource>,
    ) {
        collection.onDidChange(() => {
            logger.trace('Refreshing tree data with new items', collection.items);
            this.refresh();
        });
        selectedSample.onDidChange(() => {
            logger.debug(
                'Selected file changed, refreshing tree data',
                selectedSample.selected?.context.result.displayLog,
            );
            this.refresh();
        });
    }

    getTreeItem(node: Node): vscode.TreeItem {
        return node;
    }

    getChildren(node?: Node): Node[] {
        if (node === undefined) {
            return this.collection.items
                .map((sample) => {
                    const isSelected = this.selectedSample.selected?.context === sample.context;
                    return buildSampleSourceRootNode(sample, isSelected);
                })
                .reverse();
        }
        return node.children ?? [];
    }

    private refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

export const buildSampleSourceRootNode = (source: SampleSource, isSelected: boolean): Node => {
    if (isSourceSampleFile(source.context)) {
        return buildSampleFileRootNode(source.id, source.context.result, isSelected);
    } else {
        return buildRecordRunRootNode(source.id, source.context.result, isSelected);
    }
};

const buildSampleFileRootNode = (id: string, file: SampleFile, isSelected: boolean): Node => ({
    id: id,
    children: file.parsedContent.sampling.events.map(buildEventNode),
    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
    iconPath: buildRootNodeIcon(isSelected),
    label: file.displayName,
    contextValue: selectionContextValue(isSelected),
    resourceUri: file.uri,
});

const buildRecordRunRootNode = (id: string, run: RecordRun, isSelected: boolean): Node => ({
    id: id,
    children: run.parsedContent.sampling.events.map(buildEventNode),
    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
    iconPath: buildRootNodeIcon(isSelected),
    label: run.displayName,
    description: run.date,
    contextValue: selectionContextValue(isSelected),
    resourceUri: undefined,
});

const buildRootNodeIcon = (selected: boolean): vscode.ThemeIcon | undefined => {
    return selected
        ? new vscode.ThemeIcon('eye', new vscode.ThemeColor('list.focusOutline'))
        : new vscode.ThemeIcon('eye-closed', new vscode.ThemeColor('list.deemphasizedForeground'));
};

const selectionContextValue = (selected: boolean): string => {
    return selected ? 'rootNode--selected' : 'rootNode';
};

export const buildEventNode = (event: Event): Node => {
    const lookup = buildAnnotationLookup(event.annotate);
    return {
        children: event.samples.map((sample) =>
            buildEventSampleNode(event, sample, lookup[sample.symbol]),
        ),
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        label: event.type,
    };
};

type AnnotationByFunctionName = Record<string, Annotation>;

const buildAnnotationLookup = (annotations: Annotation[]): AnnotationByFunctionName => {
    return annotations.reduce((lookup: AnnotationByFunctionName, annotation) => {
        lookup[annotation.function_name] = annotation;
        return lookup;
    }, {});
};

export const buildEventSampleNode = (
    event: Event,
    eventSample: EventSample,
    annotation: Annotation | undefined,
): Node => {
    const children =
        annotation?.source_code.map((sourceCode) =>
            buildSourceCodeNode(event, annotation, sourceCode),
        ) || [];
    return {
        children,
        collapsibleState:
            children.length > 0
                ? vscode.TreeItemCollapsibleState.Collapsed
                : vscode.TreeItemCollapsibleState.None,
        label: eventSample.symbol,
        description: `${formatFraction(eventSample.overhead)}% (hits: ${eventSample.count})`,
    };
};

export const buildSourceCodeNode = (
    event: Event,
    annotation: Annotation,
    sourceCode: SourceCode,
): Node => ({
    collapsibleState: vscode.TreeItemCollapsibleState.None,
    description: `${formatFraction(sourceCode.overhead)}% (hits: ${sourceCode.hits})`,
    label: `${sourceCode.filename}:${sourceCode.line_number}`,
    tooltip: new vscode.MarkdownString(buildDecoration(event, annotation, sourceCode).hoverMessage),
    command: {
        command: 'vscode.open',
        title: 'Open File',
        arguments: [
            Uri.file(`${sourceCode.filename}`).with({
                fragment: sourceCode.line_number.toString(),
            }),
        ],
    },
});
