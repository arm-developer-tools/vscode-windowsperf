/**
 * Copyright (C) 2024 Arm Limited
 */

import path from 'path';

import { loadSampleFile } from '../../wperf/load';
import { Uri } from 'vscode';
import { Sample } from '../../wperf/parse/record';

export class SampleFile {
    static async fromUri(
        uri: Uri,
        load: typeof loadSampleFile = loadSampleFile,
    ): Promise<SampleFile> {
        const parsedContent = await load(uri.fsPath);
        return new SampleFile(uri, parsedContent);
    }

    constructor(
        readonly uri: Uri,
        readonly parsedContent: Sample,
    ) {}

    get displayName(): string {
        return path.basename(this.uri.path);
    }

    get displayLog(): string {
        return this.uri.toString();
    }
}
