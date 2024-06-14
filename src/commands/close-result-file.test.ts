/**
 * Copyright (C) 2024 Arm Limited
 */

import { ObservableCollection } from '../observable-collection';
import { ObservableSelection } from '../observable-selection';
import { SampleFile } from '../views/sampling-results/sample-file';
import { sampleFileFactory } from '../views/sampling-results/sample-file.factories';
import { CloseResultFile } from './close-result-file';

describe('CloseResultFile.execute', () => {
    it('removes matching file from the file list', () => {
        const fileBefore = sampleFileFactory();
        const willBeRemoved = sampleFileFactory();
        const fileAfter = sampleFileFactory();
        const files = new ObservableCollection<SampleFile>([fileBefore, willBeRemoved, fileAfter]);
        const command = new CloseResultFile(files, new ObservableSelection());

        command.execute({ resourceUri: willBeRemoved.uri });

        const wantFiles = [fileBefore, fileAfter];
        expect(files.items).toEqual(wantFiles);
    });

    describe('clearing selection', () => {
        it('deselects file, if it is the one being closed', () => {
            const selected = sampleFileFactory();
            const selection = new ObservableSelection(selected);
            const command = new CloseResultFile(new ObservableCollection(), selection);

            command.execute({ resourceUri: selected.uri });

            expect(selection.selected).toBeNull();
        });

        it('keeps selection intact if other file is being closed', () => {
            const selection = new ObservableSelection(sampleFileFactory());
            const command = new CloseResultFile(new ObservableCollection(), selection);

            command.execute({ resourceUri: sampleFileFactory().uri });

            expect(selection.selected).not.toBeNull();
        });
    });
});
