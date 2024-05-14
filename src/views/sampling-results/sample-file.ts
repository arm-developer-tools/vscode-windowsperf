/**
 * Copyright (C) 2024 Arm Limited
 */

import * as vscode from 'vscode';
import path from 'path';
import { randomUUID } from 'crypto';

import { Sample } from '../../wperf/parse';
import { loadSampleFile } from '../../wperf/load';

export class SampleFile {
    static async fromUri(
        uri: vscode.Uri,
        load: typeof loadSampleFile = loadSampleFile,
    ): Promise<SampleFile> {
        const parsedContent = await load(uri.fsPath);
        return new SampleFile(uri, parsedContent);
    }

    readonly id: string;

    constructor(
        readonly uri: vscode.Uri,
        readonly parsedContent: Sample
    ) {
        this.id = randomUUID();
    }

    get displayName(): string {
        return path.basename(this.uri.path);
    }
}
