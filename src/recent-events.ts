/**
 * Copyright (C) 2024 Arm Limited
 */

import * as z from 'zod';
import { RecordOptions } from './wperf/record-options';

export const MAXIMUM_RECENT_EVENTS = 5;

export const recentEventsShape = z.array(z.string());

export const updateRecentEvents = (
    recentEvents: string[],
    recordOptions: RecordOptions,
): string[] => {
    const newEvents = recordOptions.events.map((event) => event.event);
    const filteredRecentEvents = recentEvents.filter((event) => !newEvents.includes(event));
    return [...newEvents, ...filteredRecentEvents].slice(0, MAXIMUM_RECENT_EVENTS);
};
