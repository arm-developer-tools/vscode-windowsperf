/**
 * Copyright (C) 2024 Arm Limited
 */

import path from 'path';

export const isSamePath = (p1: string, p2: string): boolean => {
    return path.relative(p1, p2) === '';
};
