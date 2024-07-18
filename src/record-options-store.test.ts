/**
 * Copyright (C) 2024 Arm Limited
 */

import 'jest';
import type { Memento } from 'vscode';
import { MementoRecordOptionsStore } from './record-options-store';
import { defaultRecordOptions } from './wperf/record-options';
import { recordOptionsFactory } from './wperf/record-options.factories';

const mementoFactory = (): jest.Mocked<Pick<Memento, 'get' | 'update'>> => ({
    get: jest.fn(),
    update: jest.fn(),
});

describe('RecordOptionsStore', () => {
    it('returns the default options when the memento is empty', () => {
        const memento = mementoFactory();
        memento.get.mockReturnValue(undefined);
        const settings = new MementoRecordOptionsStore(memento);

        const got = settings.recordOptions;

        expect(got).toEqual(defaultRecordOptions);
    });

    it('returns the stored options when the memento is not empty', () => {
        const recordOptions = recordOptionsFactory();
        const memento = mementoFactory();
        memento.get.mockReturnValue(recordOptions);
        const settings = new MementoRecordOptionsStore(memento);

        const got = settings.recordOptions;

        expect(got).toEqual(recordOptions);
    });

    it('returns the default options when the stored options are invalid', () => {
        const memento = mementoFactory();
        memento.get.mockReturnValue({ events: 'not an array' });
        const settings = new MementoRecordOptionsStore(memento);

        const got = settings.recordOptions;

        expect(got).toEqual(defaultRecordOptions);
    });

    it('updates the stored options when the field is set', () => {
        const memento = mementoFactory();
        const settings = new MementoRecordOptionsStore(memento);
        const recordOptions = recordOptionsFactory();
        settings.recordOptions = recordOptions;

        const got = settings.recordOptions;

        expect(got).toEqual(defaultRecordOptions);
        expect(memento.update).toHaveBeenCalledWith(
            MementoRecordOptionsStore.mementoKey,
            recordOptions,
        );
    });
});
