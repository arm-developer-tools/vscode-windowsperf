/**
 * Copyright (C) 2024 Arm Limited
 */

import { faker } from '@faker-js/faker';
import { EventAndFrequency, RecordOptions } from '../../../wperf/record-options';
import {
    getAffectedField,
    isUpdateRecordOptionAction,
    UpdateRecordOptionAction,
    updateRecordOptionReducer,
} from './update-record-option-action';
import {
    eventAndFrequencyFactory,
    recordOptionsFactory,
} from '../../../wperf/record-options.factories';

describe('isUpdateRecordOptionAction', () => {
    it.each([
        ['addEvent', { type: 'addEvent', event: 'newEvent' }],
        ['setCommand', { type: 'setCommand', command: 'newCommand' }],
        ['setArguments', { type: 'setArguments', arguments: 'newArguments' }],
        ['removeEvent', { type: 'removeEvent', event: 'toRemoveEvent' }],
        ['setCore', { type: 'setCore', core: 5 }],
        ['setTimeout', { type: 'setTimeout', timeout: '10000000' }],
    ] as const)('returns true for %s actions', (_, action: UpdateRecordOptionAction) => {
        expect(isUpdateRecordOptionAction(action)).toBe(true);
    });

    it('returns false for unknown actions', () => {
        const action = { type: 'unknown', field: 'value' };
        expect(isUpdateRecordOptionAction(action)).toBe(false);
    });
});

describe('getAffectedField', () => {
    it.each([
        ['addEvent', 'events', { type: 'addEvent', event: 'newEvent' }],
        ['setCommand', 'command', { type: 'setCommand', command: 'newCommand' }],
        ['setArguments', 'arguments', { type: 'setArguments', arguments: 'newArguments' }],
        ['removeEvent', 'events', { type: 'removeEvent', event: 'toRemoveEvent' }],
        ['setCore', 'core', { type: 'setCore', core: 5 }],
        ['setTimeout', 'timeoutSeconds', { type: 'setTimeout', timeout: '10000000' }],
    ] as const)(
        'returns the affected field for %s actions',
        (_, field: keyof RecordOptions, action: UpdateRecordOptionAction) => {
            expect(getAffectedField(action)).toBe(field);
        },
    );
});

describe('updateRecordOptionReducer', () => {
    it('handles an setCommand action', () => {
        const newCommand = 'newCommand';

        const got = updateRecordOptionReducer(recordOptionsFactory(), {
            type: 'setCommand',
            command: newCommand,
        });

        expect(got.command).toBe(newCommand);
    });

    it('handles an setArguments action', () => {
        const newArguments = '--new-arguments';

        const got = updateRecordOptionReducer(recordOptionsFactory(), {
            type: 'setArguments',
            arguments: newArguments,
        });

        expect(got.arguments).toBe(newArguments);
    });

    it('handles an addEvent action', () => {
        const initialEventAndFrequency = eventAndFrequencyFactory();

        const got = updateRecordOptionReducer(
            recordOptionsFactory({ events: [initialEventAndFrequency] }),
            {
                type: 'addEvent',
                event: 'new_event',
            },
        );

        const want: EventAndFrequency[] = [
            initialEventAndFrequency,
            { event: 'new_event', frequency: undefined },
        ];
        expect(got.events).toEqual(expect.arrayContaining(want));
    });

    it('handles a removeEvent action', () => {
        const eventName = 'event_to_remove';
        const got = updateRecordOptionReducer(
            recordOptionsFactory({ events: [eventAndFrequencyFactory({ event: eventName })] }),
            {
                type: 'removeEvent',
                event: eventName,
            },
        );

        expect(got.events).toEqual([]);
    });

    it('handles a setCore action', () => {
        const newCore = 2;

        const got = updateRecordOptionReducer(recordOptionsFactory(), {
            type: 'setCore',
            core: newCore,
        });

        expect(got.core).toBe(newCore);
    });

    it('handles a setTimeout action', () => {
        const newTimeout = faker.number.int();

        const got = updateRecordOptionReducer(recordOptionsFactory(), {
            type: 'setTimeout',
            timeout: newTimeout.toString(),
        });

        expect(got.timeoutSeconds).toBe(newTimeout);
    });
});
