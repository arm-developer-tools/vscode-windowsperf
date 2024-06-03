/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { Annotation, Event, EventSample, SourceCode } from '../../wperf/parse';
import { ObservableCollection } from '../../observable-collection';
import { ObservableSelection } from '../../observable-selection';
import { formatFraction } from '../../math';
import { SampleFile } from './sample-file';
import { buildDecoration } from './source-code-decoration';
import { Uri } from 'vscode';
import { logger } from '../../logging/logger';

type Node = vscode.TreeItem & { children?: Node[] };

export class TreeDataProvider implements vscode.TreeDataProvider<Node> {
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(
        private readonly sampleFiles: ObservableCollection<SampleFile>,
        private readonly selectedFile: ObservableSelection<SampleFile>,
    ) {
        sampleFiles.onDidChange(() => {
            logger.debug('Sample files changed, refreshing tree data');
            logger.trace('Sample files', sampleFiles.items);
            this.refresh();
        });
        selectedFile.onDidChange(() => {
            logger.debug('Selected file changed, refreshing tree data', selectedFile.selected?.uri.toString());
            this.refresh();
        });
    }

    getTreeItem(node: Node): vscode.TreeItem {
        return node;
    }

    getChildren(node?: Node): Node[] {
        if (node === undefined) {
            return this.sampleFiles.items.map(file => {
                const isSelected = this.selectedFile.selected === file;
                return buildRootNode(file, isSelected);
            });
        }
        return node.children ?? [];
    }

    private refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

export const buildRootNode = (file: SampleFile, isSelected: boolean): Node => ({
    id: file.id,
    children: file.parsedContent.sampling.events.map(buildEventNode),
    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
    iconPath: rootNodeIcon(isSelected),
    label: file.displayName,
    contextValue: rootNodeContextValue(isSelected),
    resourceUri: file.uri,
});

const rootNodeContextValue = (selected: boolean): string => {
    return selected ? 'sampleFile--selected' : 'sampleFile';
};

const rootNodeIcon = (selected: boolean): vscode.ThemeIcon | undefined => {
    return selected
        ? new vscode.ThemeIcon('eye', new vscode.ThemeColor('list.focusOutline'))
        : new vscode.ThemeIcon('eye-closed', new vscode.ThemeColor('list.deemphasizedForeground'));
};

export const buildEventNode = (event: Event): Node => {
    const lookup = buildAnnotationLookup(event.annotate);
    return {
        children: event.samples.map(
            sample => buildEventSampleNode(event, sample, lookup[sample.symbol])
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
    annotation: Annotation | undefined
): Node => {
    const children = annotation?.source_code.map(
        sourceCode => buildSourceCodeNode(event, annotation, sourceCode)
    ) || [];
    return {
        children,
        collapsibleState: children.length > 0
            ? vscode.TreeItemCollapsibleState.Collapsed
            : vscode.TreeItemCollapsibleState.None,
        label: eventSample.symbol,
        description: `${formatFraction(eventSample.overhead)}% (hits: ${eventSample.count})`,
    };
};

export const buildSourceCodeNode = (event: Event, annotation: Annotation, sourceCode: SourceCode): Node => ({
    collapsibleState: vscode.TreeItemCollapsibleState.None,
    description: `${formatFraction(sourceCode.overhead)}% (hits: ${sourceCode.hits})`,
    label: `${sourceCode.filename}:${sourceCode.line_number}`,
    tooltip: new vscode.MarkdownString(buildDecoration(event, annotation, sourceCode).hoverMessage),
    command: {
        command: 'vscode.open',
        title: 'Open File',
        arguments: [
            Uri
                .file(`${sourceCode.filename}`)
                .with({ fragment: sourceCode.line_number.toString() })
        ],
    }
});
