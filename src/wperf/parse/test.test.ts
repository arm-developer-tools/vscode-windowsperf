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

import 'jest';
import { findTestResult, parseHexNumber, parseTestJson, TestResults } from './test';
import { loadFixtureFile } from '../fixtures';

describe('parseHexNumber', () => {
    it('parses a hex number 5', () => {
        expect(parseHexNumber('0x0005')).toBe(5);
    });

    it('parses a hex number 2^26', () => {
        expect(parseHexNumber('0x4000000')).toBe(67108864);
    });

    it('throws a ValidationError if the input is not a valid hex format', () => {
        expect(() => parseHexNumber('0x')).toThrow();
    });
});

describe('findTestResult', () => {
    it('finds a test result', () => {
        const testResults = [
            { Test_Name: 'test1', Result: 'result1' },
            { Test_Name: 'test2', Result: 'result2' },
        ];

        const got = findTestResult(testResults, 'test1');

        expect(got).toEqual({ Test_Name: 'test1', Result: 'result1' });
    });

    it('throws an error if the test result is not found', () => {
        const testResults = [
            { Test_Name: 'test1', Result: 'result1' },
            { Test_Name: 'test2', Result: 'result2' },
        ];

        expect(() => findTestResult(testResults, 'test3')).toThrow();
    });
});

describe('parseTestJson', () => {
    it('parses wperf output JSON', async () => {
        const json = await loadFixtureFile('wperf-3.7.2.test.json');

        const got = parseTestJson(json);

        const want: TestResults = {
            availableGpcCount: 0x0004,
            totalGpcCount: 0x0005,
            samplingIntervalDefault: 0x4000000,
        };

        expect(got).toEqual(want);
    });
});
