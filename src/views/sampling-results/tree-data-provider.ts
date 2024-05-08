/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';

import { buildSourceCodeUri } from './resource-uri';
import { Annotation, Event, Sample, SourceCode } from '../../wperf/projected-types';

type Node = vscode.TreeItem & { children?: Node[] };

export class TreeDataProvider implements vscode.TreeDataProvider<Node> {
    private readonly root: Node[];

    constructor(sample: Sample) {
        this.root = [buildRootNode(sample)];
    }

    getTreeItem(node: Node): vscode.TreeItem {
        return node;
    }

    getChildren(node?: Node): Node[] {
        if (node === undefined) {
            return this.root;
        }
        return node.children ?? [];
    }
}

export const buildRootNode = (sample: Sample): Node => ({
    children: sample.sampling.events.map(buildEventNode),
    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
    iconPath: new vscode.ThemeIcon('graph'),
    label: (new Date()).toString(), // TODO: date from file name?
});

export const buildEventNode = (event: Event): Node => ({
    children: event.annotate.map(buildAnnotationNode),
    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
    iconPath: new vscode.ThemeIcon('symbol-event'),
    label: event.type,
});

export const buildAnnotationNode = (annotation: Annotation): Node => ({
    children: annotation.source_code.map(buildSourceCodeNode),
    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
    iconPath: new vscode.ThemeIcon('symbol-method'),
    label: annotation.function_name,
});

export const buildSourceCodeNode = (sourceCode: SourceCode): Node => ({
    collapsibleState: vscode.TreeItemCollapsibleState.None,
    description: `hits: ${sourceCode.hits}`,
    iconPath: new vscode.ThemeIcon('symbol-file'),
    label: sourceCode.filename,
    resourceUri: buildSourceCodeUri(sourceCode),
});
