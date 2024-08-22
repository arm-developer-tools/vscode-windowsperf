/**
 * Copyright (C) 2024 Arm Limited
 */

import * as z from 'zod';
import { validateAgainstShape } from './validate';

const testResultShape = z.object({
    Test_Name: z.string(),
    Result: z.string(),
});

type TestResult = z.infer<typeof testResultShape>;

const testOutputShape = z.object({
    Test_Results: z.array(testResultShape),
});

export const testResultsShape = z.object({
    samplingIntervalDefault: z.number(),
    availableGpcCount: z.number(),
    totalGpcCount: z.number(),
});

export type TestResults = z.infer<typeof testResultsShape>;

const gpcNumTestName = 'PMU_CTL_QUERY_HW_CFG [gpc_num]';
const totalGpcNumTestName = 'PMU_CTL_QUERY_HW_CFG [total_gpc_num]';
const samplingIntervalDefaultTestName = 'pmu_device.sampling.INTERVAL_DEFAULT';

export const parseHexNumber = (hex: string): number => {
    const parsed = parseInt(hex, 16);
    if (isNaN(parsed)) {
        throw new Error(`Invalid number ${hex}`);
    }
    return parsed;
};

export const findTestResult = (testResults: TestResult[], testName: string): TestResult => {
    const testResult = testResults.find((testResult) => testResult.Test_Name === testName);
    if (!testResult) {
        throw new Error(`Test result not found: ${testName}`);
    }
    return testResult;
};

const readHexTestResult = (testResults: TestResult[], testName: string): number => {
    const testResult = findTestResult(testResults, testName);
    return parseHexNumber(testResult.Result);
};

export const parseTestJson = (json: string): TestResults => {
    const data = JSON.parse(json);
    const validatedData = validateAgainstShape(testOutputShape, data);
    return {
        samplingIntervalDefault: readHexTestResult(
            validatedData.Test_Results,
            samplingIntervalDefaultTestName,
        ),
        availableGpcCount: readHexTestResult(validatedData.Test_Results, gpcNumTestName),
        totalGpcCount: readHexTestResult(validatedData.Test_Results, totalGpcNumTestName),
    };
};
