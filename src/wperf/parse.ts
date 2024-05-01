/**
 * Copyright (C) 2024 Arm Limited
 */

import { Sample } from "./schemas/out/sample";
import Ajv, { DefinedError } from "ajv";
import * as schemaSample from "./schemas/in/sample.json";

const ajv = new Ajv();
const validateSample = ajv.compile<Sample>(schemaSample);

export const parseSampleJson = (json: string): Sample => {
    const data = JSON.parse(fixWperfOutput(json));
    if (validateSample(data)) {
        return data;
    }
    throw new SchemaValidationError(validateSample.errors as DefinedError[]);
};

// Wperf outputs literal tab characters in the "disassemble" > "instruction" fields.
// Literal tabs are not allowed in JSON string fields.
function fixWperfOutput(content: string): string {
    return content.replaceAll("\t", "    ");
}

export class SchemaValidationError extends Error {
    constructor(readonly validationErrors: DefinedError[]) {
        super('Parsed json does not match the schema');
        this.name = 'SchemaValidationError';
        Object.setPrototypeOf(this, SchemaValidationError.prototype);
    }
}
