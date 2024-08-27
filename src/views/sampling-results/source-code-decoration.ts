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
    totalFileHits: number;
}

export const buildDecoration = ({
    filename,
    lineNumber,
    content,
    lineHits,
    totalFileHits,
}: BuildDecorationParams): Decoration => {
    const fileNameFromPath = basename(filename);
    const totalLineOverhead = percentage(lineHits, totalFileHits);
    let hoverMessage = '';
    for (const c of content) {
        hoverMessage += renderFileHoverMessage({
            fileNameFromPath,
            eventType: c.eventType,
            functionName: c.functionName,
            sourceCode: c.sourceCode,
            totalFileHits,
        });
    }

    return {
        filename,
        lineNumber,
        backgroundColor: textEditorColour(totalLineOverhead),
        hoverMessage: `
### Sampling Results 
${content.length > 1 ? renderTotalSection(fileNameFromPath, lineHits, totalLineOverhead) : ''}
${hoverMessage} 
`,
        after: textEditorInlineComments(lineHits, totalLineOverhead),
    };
};

export const renderTotalSection = (
    fileNameFromPath: string,
    hits: number,
    overhead: number,
): string => {
    return `
* Hits: **${hits}**
* Overhead: **${formatFraction(overhead)}%** - _${fileNameFromPath}_
---
`;
};

interface RenderFileHoverMessageParams {
    fileNameFromPath: string;
    eventType: string;
    functionName: string;
    sourceCode: SourceCode;
    totalFileHits: number;
}

export const renderFileHoverMessage = ({
    fileNameFromPath,
    eventType,
    functionName,
    sourceCode,
    totalFileHits,
}: RenderFileHoverMessageParams): string => {
    const eventOverhead = percentage(sourceCode.hits, totalFileHits);
    return `
### ${eventType}
* Function: **${functionName}**
* Hits: **${sourceCode.hits}**
* Overhead: 
    * **${formatFraction(eventOverhead)}%** - _${fileNameFromPath}_
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
