/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { buildSourceCodeUri } from './resource-uri';
import { Annotation, Event, SourceCode } from '../../wperf/parse';
import { ObservableCollection } from '../../observable-collection';
import { ObservableSelection } from '../../observable-selection';
import { SampleFile } from './sample-file';

type Node = vscode.TreeItem & { children?: Node[] };

export class TreeDataProvider implements vscode.TreeDataProvider<Node> {
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(
        private readonly sampleFiles: ObservableCollection<SampleFile>,
        private readonly selectedFile: ObservableSelection<SampleFile>,
    ) {
        sampleFiles.onDidChange(() => this.refresh());
        selectedFile.onDidChange(() => this.refresh());
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

export const buildEventNode = (event: Event): Node => ({
    children: event.annotate.map(buildAnnotationNode),
    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
    label: event.type,
});

export const buildAnnotationNode = (annotation: Annotation): Node => ({
    children: annotation.source_code.map(buildSourceCodeNode),
    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
    label: annotation.function_name,
});

export const buildSourceCodeNode = (sourceCode: SourceCode): Node => ({
    collapsibleState: vscode.TreeItemCollapsibleState.None,
    description: `hits: ${sourceCode.hits} (${sourceCode.overhead}%)`,
    label: `${sourceCode.filename}:${sourceCode.line_number}`,
    resourceUri: buildSourceCodeUri(sourceCode),
    command: {
        command: 'vscode.open',
        title: 'Open File',
        arguments: [
            vscode.Uri
                .file(`${sourceCode.filename}`)
                .with({ fragment: sourceCode.line_number.toString() })
        ],
    }
});
