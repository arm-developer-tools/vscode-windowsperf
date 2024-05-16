/*
 * Copyright (c) 2024 Arm Limited
 */

import { formatFraction } from '../../math';
import { Annotation, Event, SourceCode } from '../../wperf/parse';
import { textEditorColour } from './colours';

export type Decoration = SourceCode & {
    backgroundColor: string
    hoverMessage: string
};

export const buildDecoration = (
    event: Event,
    annotation: Annotation,
    sourceCode: SourceCode
): Decoration => ({
    ...sourceCode,
    backgroundColor: textEditorColour(sourceCode.hits),
    hoverMessage: renderHoverMessage(event, annotation, sourceCode),
});

const renderHoverMessage = (
    event: Event,
    annotation: Annotation,
    sourceCode: SourceCode
): string => {
    return `
### WindowsPerf
* Event: ${event.type}
* Function: ${annotation.function_name}
* Hits: ${sourceCode.hits}
* Overhead: ${formatFraction(sourceCode.overhead)}%

#### Disassembly
${'```'}
${renderDisassembly(sourceCode)}
${'```'}
`;
};

const renderDisassembly = (sourceCode: SourceCode): string => {
    return sourceCode.disassembled_line.disassemble.map(line => {
        const marker = line.address === sourceCode.instruction_address
            ? '<-'
            : '  ';
        return `${line.address} ${marker} | ${line.instruction}`;
    }).join('\n');
};
