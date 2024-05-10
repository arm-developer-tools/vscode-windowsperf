/**
 * Copyright (C) 2024 Arm Limited
 */

import { ObservableCollection } from '../observable-collection';
import { SampleFile } from '../views/sampling-results/sample-file';
import { sampleFileFactory } from '../views/sampling-results/sample-file.factories';
import { CloseResultFile } from './close-result-file';

describe('CloseResultFile.execute', () => {
    it('removes matching file from the file list', () => {
        const fileBefore = sampleFileFactory();
        const willBeRemoved = sampleFileFactory();
        const fileAfter = sampleFileFactory();
        const files = new ObservableCollection<SampleFile>([
            fileBefore, willBeRemoved, fileAfter
        ]);
        const command = new CloseResultFile(files);

        command.execute({ resourceUri: willBeRemoved.uri });

        const wantFiles = [fileBefore, fileAfter];
        expect(files.items).toEqual(wantFiles);
    });
});
