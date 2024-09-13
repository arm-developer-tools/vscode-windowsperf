/**
 * Copyright 2024 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import path from 'path';

import { loadSampleFile } from '../../wperf/load';
import { Uri } from 'vscode';
import { Sample } from '../../wperf/parse/record';

export class SampleFile {
    static async fromUri(uri: Uri, load = loadSampleFile): Promise<SampleFile> {
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

    get treeContextName(): string {
        return 'sampleFile';
    }
}
