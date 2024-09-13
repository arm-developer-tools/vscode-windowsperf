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

import * as z from 'zod';
import { validateAgainstShape } from './validate';

export const predefinedEventShape = z.object({
    Alias_Name: z.string(),
    Description: z.string().optional(),
});

const listOutputShape = z.object({
    Predefined_Events: z.array(predefinedEventShape),
});

export type ListOutputJson = z.infer<typeof listOutputShape>;
export type PredefinedEvent = z.infer<typeof predefinedEventShape>;

export const parseListJson = (json: string): PredefinedEvent[] => {
    const data = JSON.parse(json);
    return validateAgainstShape(listOutputShape, data).Predefined_Events;
};
