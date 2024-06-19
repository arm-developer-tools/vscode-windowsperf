/*
 * Copyright (c) 2024 Arm Limited
 */
import * as vscode from 'vscode';

import { formatFraction } from '../../math';
import { textEditorColour } from './colours';
import { SourceCode, Annotation, Event, DisassemblyInstruction } from '../../wperf/parse/record';

export type Decoration = SourceCode & {
    backgroundColor: string;
    hoverMessage: string;
    after: vscode.ThemableDecorationAttachmentRenderOptions;
};

export const buildDecoration = (
    event: Event,
    annotation: Annotation,
    sourceCode: SourceCode,
): Decoration => ({
    ...sourceCode,
    backgroundColor: textEditorColour(sourceCode.overhead),
    hoverMessage: renderHoverMessage(event, annotation, sourceCode),
    after: textEditorInlineComments(sourceCode.hits, sourceCode.overhead),
});

const renderHoverMessage = (
    event: Event,
    annotation: Annotation,
    sourceCode: SourceCode,
): string => {
    return `
### WindowsPerf
* Event: ${event.type}
* Function: ${annotation.function_name}
* Hits: ${sourceCode.hits}
* Overhead: ${formatFraction(sourceCode.overhead)}%
${renderDisassemblySection(sourceCode)}
`;
};

const renderDisassemblySection = (sourceCode: SourceCode): string => {
    if (
        sourceCode.disassembled_line === undefined ||
        sourceCode.instruction_address === undefined
    ) {
        return '';
    } else
        return `
#### Disassembly
${'```'}
${renderDisassembly(sourceCode.instruction_address, sourceCode.disassembled_line.disassemble)}
${'```'}
`;
};

const renderDisassembly = (
    instructionAddress: string,
    disassemblyInstructions: DisassemblyInstruction[],
): string => {
    return disassemblyInstructions
        .map((line) => {
            const marker = line.address === instructionAddress ? '<-' : '  ';
            return `${line.address} ${marker} | ${line.instruction}`;
        })
        .join('\n');
};

const textEditorInlineComments = (
    hits: number,
    overhead: number,
): vscode.ThemableDecorationAttachmentRenderOptions => {
    return {
        contentText: `${formatFraction(overhead)}% (${hits} hits)`,
        fontStyle: 'italic',
        margin: '30px',
        color: new vscode.ThemeColor('editor.inlineValuesForeground'),
    };
};
