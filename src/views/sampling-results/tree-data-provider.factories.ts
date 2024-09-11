/*
 * Copyright (c) 2024 Arm Limited
 */
import { faker } from '@faker-js/faker';
import { Node } from './tree-data-provider';
import { randomUUID } from 'crypto';

export const treeDataNodeFactory = (options?: Partial<Node>): Node => ({
    id: randomUUID(),
    collapsibleState: 1,
    label: faker.word.noun(),
    description: faker.word.words(3),
    contextValue: faker.word.noun(),
    ...options,
});
