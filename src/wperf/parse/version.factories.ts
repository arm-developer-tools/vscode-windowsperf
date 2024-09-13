import { faker } from '@faker-js/faker';
import { Version } from './version';

export const versionFactory = (options?: Partial<Version>) => ({
    Component: faker.word.noun(),
    Version: faker.word.noun(),
    ...options,
});
