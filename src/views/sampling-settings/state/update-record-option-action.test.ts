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
        ['addEvent', { type: 'addEvent', event: eventAndFrequencyFactory() }],
        ['setCommand', { type: 'setCommand', command: 'newCommand' }],
        ['setArguments', { type: 'setArguments', arguments: 'newArguments' }],
        ['removeEvent', { type: 'removeEvent', index: 1 }],
        ['editEvent', { type: 'editEvent', index: 1, event: eventAndFrequencyFactory() }],
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
        ['addEvent', 'events', { type: 'addEvent', event: eventAndFrequencyFactory() }],
        ['setCommand', 'command', { type: 'setCommand', command: 'newCommand' }],
        ['setArguments', 'arguments', { type: 'setArguments', arguments: 'newArguments' }],
        ['removeEvent', 'events', { type: 'removeEvent', index: 1 }],
        ['editEvent', 'events', { type: 'editEvent', index: 1, event: eventAndFrequencyFactory() }],
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
    it('handles a setCommand action', () => {
        const newCommand = 'newCommand';

        const got = updateRecordOptionReducer(recordOptionsFactory(), {
            type: 'setCommand',
            command: newCommand,
        });

        expect(got.command).toBe(newCommand);
    });

    it('handles a setArguments action', () => {
        const newArguments = '--new-arguments';

        const got = updateRecordOptionReducer(recordOptionsFactory(), {
            type: 'setArguments',
            arguments: newArguments,
        });

        expect(got.arguments).toBe(newArguments);
    });

    it('handles an addEvent action', () => {
        const initialEventAndFrequency = eventAndFrequencyFactory();
        const newEvent = eventAndFrequencyFactory();

        const got = updateRecordOptionReducer(
            recordOptionsFactory({ events: [initialEventAndFrequency] }),
            {
                type: 'addEvent',
                event: newEvent,
            },
        );

        const want: EventAndFrequency[] = [initialEventAndFrequency, newEvent];
        expect(got.events).toEqual(expect.arrayContaining(want));
    });

    it('handles an editEvent action', () => {
        const anotherEventAndFrequency = eventAndFrequencyFactory();
        const initialEventAndFrequency = eventAndFrequencyFactory();
        const newEvent = eventAndFrequencyFactory();

        const got = updateRecordOptionReducer(
            recordOptionsFactory({ events: [anotherEventAndFrequency, initialEventAndFrequency] }),
            {
                type: 'editEvent',
                index: 1,
                event: newEvent,
            },
        );

        const want: EventAndFrequency[] = [anotherEventAndFrequency, newEvent];
        expect(got.events).toEqual(expect.arrayContaining(want));
    });

    it('handles a removeEvent action', () => {
        const remainingEventAndFrequency = eventAndFrequencyFactory();
        const got = updateRecordOptionReducer(
            recordOptionsFactory({
                events: [remainingEventAndFrequency, eventAndFrequencyFactory()],
            }),
            {
                type: 'removeEvent',
                index: 1,
            },
        );

        expect(got.events).toEqual([remainingEventAndFrequency]);
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
