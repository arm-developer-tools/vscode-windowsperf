/*
 * Copyright (c) 2024 Arm Limited
 */

import * as d3 from 'd3';

export const textEditorColour = (overhead: number): string => {
    const colorScale = d3.scaleSequential([0, 100], d3.interpolateTurbo);
    const colour = colorScale(overhead);
    const opacity = '0.3';
    return `${colour.slice(0, -1)}, ${opacity})`;
};
