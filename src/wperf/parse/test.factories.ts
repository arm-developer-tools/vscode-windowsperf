/**
 * Copyright (C) 2024 Arm Limited
 */

import { faker } from '@faker-js/faker';
import { TestResults } from './test';

export const testResultsFactory = (options?: Partial<TestResults>): TestResults => ({
    samplingIntervalDefault: options?.samplingIntervalDefault ?? faker.number.int(),
    availableGpcCount: options?.availableGpcCount ?? faker.number.int(),
    totalGpcCount: options?.totalGpcCount ?? faker.number.int(),
});
