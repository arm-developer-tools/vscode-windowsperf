/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { basename } from 'path';

import { ObservableCollection } from '../../observable-collection';
import { ObservableSelection } from '../../observable-selection';
import { formatFraction } from '../../math';
import { renderTreeHoverMessage } from './source-code-decoration';
import { Uri } from 'vscode';
import { logger } from '../../logging/logger';
import { SampleSource, Source, isSourceRecordRun, isSourceSampleFile } from './sample-source';
import { SourceCode, Event, Annotation, EventSample } from '../../wperf/parse/record';

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
            return this.collection.items.map((sample) => {
                const isSelected = this.selectedSample.selected?.context === sample.context;
                return buildSampleSourceRootNode(sample, isSelected);
            });
        }
        return node.children ?? [];
    }

    private refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

export const buildSampleSourceRootNode = (source: SampleSource, isSelected: boolean): Node => {
    return {
        id: source.id,
        children: source.context.result.parsedContent.map(buildEventNode),
        label: source.context.result.displayName,
        description: getDescription(source.context),
        resourceUri: getResourceUri(source.context),
        contextValue: getContextValue(source.context.result.treeContextName, isSelected),
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        iconPath: buildRootNodeIcon(isSelected),
    };
};

const buildRootNodeIcon = (selected: boolean): vscode.ThemeIcon | undefined => {
    return selected
        ? new vscode.ThemeIcon('eye', new vscode.ThemeColor('list.focusOutline'))
        : new vscode.ThemeIcon('eye-closed', new vscode.ThemeColor('list.deemphasizedForeground'));
};

const getContextValue = (name: string, selected: boolean): string => {
    const isSelected = selected ? '--selected' : '';
    return `${name}${isSelected}`;
};

const getDescription = (source: Source): string | undefined => {
    if (isSourceRecordRun(source)) {
        return source.result.date;
    }
    return undefined;
};

const getResourceUri = (source: Source): Uri | undefined => {
    if (isSourceSampleFile(source)) {
        return source.result.uri;
    }
    return undefined;
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
        annotation?.source_code.map((sourceCode: SourceCode) =>
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
): Node => {
    const fileNameFromPath = basename(sourceCode.filename);

    return {
        label: `${fileNameFromPath}:${sourceCode.line_number}`,
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        description: `${formatFraction(sourceCode.overhead)}% (hits: ${sourceCode.hits})`,
        tooltip: new vscode.MarkdownString(renderTreeHoverMessage(event, annotation, sourceCode)),
        command: {
            command: 'vscode.open',
            title: 'Open File',
            arguments: [
                Uri.file(`${sourceCode.filename}`).with({
                    fragment: sourceCode.line_number.toString(),
                }),
            ],
        },
    };
};
