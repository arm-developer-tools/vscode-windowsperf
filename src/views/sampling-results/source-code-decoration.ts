/*
 * Copyright (c) 2024 Arm Limited
 */
import * as vscode from 'vscode';

import { formatFraction, percentage } from '../../math';
import { textEditorColour } from './colours';
import {
    SourceCode,
    Annotation,
    Event,
    DisassemblyInstruction,
    SampleHitDetails,
} from '../../wperf/parse/record';
import { basename } from 'path';

export type Decoration = {
    filename: string;
    lineNumber: number;
    backgroundColor: string;
    hoverMessage: string;
    after: vscode.ThemableDecorationAttachmentRenderOptions;
};

export interface BuildDecorationParams {
    filename: string;
    lineNumber: number;
    content: SampleHitDetails[];
    lineHits: number;
    totalSampleHits: number;
}

export const buildDecoration = ({
    filename,
    lineNumber,
    content,
    lineHits,
    totalSampleHits,
}: BuildDecorationParams): Decoration => {
    const fileNameFromPath = basename(filename);
    const totalOverhead = percentage(lineHits, totalSampleHits);
    let hoverMessage = '';
    for (const c of content) {
        hoverMessage += renderFileHoverMessage({
            fileNameFromPath,
            eventType: c.eventType,
            functionName: c.functionName,
            sourceCode: c.sourceCode,
            totalSampleHits,
        });
    }

    return {
        filename,
        lineNumber,
        backgroundColor: textEditorColour(totalOverhead),
        hoverMessage: `
### Sampling Results 
${renderTotalSection(lineHits, totalOverhead)}
${hoverMessage} 
`,
        after: textEditorInlineComments(lineHits, totalOverhead),
    };
};

export const renderTotalSection = (hits: number, overhead: number): string => {
    return `
* ${formatFraction(overhead)}% (${hits} hits) - _sample_
---
`;
};

interface RenderFileHoverMessageParams {
    fileNameFromPath: string;
    eventType: string;
    functionName: string;
    sourceCode: SourceCode;
    totalSampleHits: number;
}

export const renderFileHoverMessage = ({
    eventType,
    functionName,
    sourceCode,
    totalSampleHits,
}: RenderFileHoverMessageParams): string => {
    const eventOverhead = percentage(sourceCode.hits, totalSampleHits);
    return `
### ${eventType}
* Function: **${functionName}**
* Hits: **${sourceCode.hits}**
* Overhead: 
    * **${formatFraction(eventOverhead)}%** - _sample_
    * **${formatFraction(sourceCode.overhead)}%** - _${eventType} -> ${functionName}_
${renderDisassemblySection(sourceCode)}
---
`;
};

export const renderTreeHoverMessage = (
    event: Event,
    annotation: Annotation,
    sourceCode: SourceCode,
): string => {
    const fileNameFromPath = basename(sourceCode.filename);
    return `
### ${fileNameFromPath}:${sourceCode.line_number}
* Event: **${event.type}**
* Function: **${annotation.function_name}**
* Hits: **${sourceCode.hits}**
* Overhead: **${formatFraction(sourceCode.overhead)}%**
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
${'```arm'}
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
