/*
 * Copyright (c) 2024 Arm Limited
 */

import * as d3 from 'd3';

export const textEditorColour = (overhead: number): string => {
    const colorScale = d3.scaleSequential([0, 100], d3.interpolateTurbo);
    return colorScale(overhead);
};
