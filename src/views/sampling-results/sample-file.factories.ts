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

import { faker } from '@faker-js/faker';

import { SampleFile } from './sample-file';
import { Uri } from 'vscode';
import { sampleFactory } from '../../wperf/parse/record.factories';

export const sampleFileFactory = (options?: Partial<SampleFile>): SampleFile => {
    const uri = options?.uri ?? Uri.file(faker.system.filePath());
    const parsedContent = options?.parsedContent ?? sampleFactory();
    return new SampleFile(uri, parsedContent);
};
