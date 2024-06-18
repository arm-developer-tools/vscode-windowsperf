/**
 * Copyright (C) 2024 Arm Limited
 */

import { faker } from '@faker-js/faker';
import { PredefinedEvent } from './list';

export const predefinedEventFactory = (options?: Partial<PredefinedEvent>): PredefinedEvent => ({
    Alias_Name: options?.Alias_Name ?? faker.word.noun(),
    Description: options?.Description ?? faker.lorem.sentence(),
});
