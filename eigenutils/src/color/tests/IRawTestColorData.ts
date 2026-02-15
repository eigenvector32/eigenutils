// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

export interface IRawTestColorData {
    version: string;
    data: IRawTestColorDataItem[];
}

export interface IRawTestColorDataItem {
    r?: number;
    g?: number;
    b?: number;
    hex?: string;
    name?: string;
    xyzD65?: string;
    xyzD50?: string;
    labD65?: string;
    labD50?: string;
    srgbD65?: string;
    srgbLinearD65?: string;
    luvD65?: string;
    oklabD65?: string;
    lchuvD65?: string;
    oklchD65?: string;
    lchD50?: string;
    hslD65?: string;
    hsvD65?: string;
    hsluvD65?: string;
}

export function parseTriplet(input?: string | null): number[] {
    if (input === undefined || input === null) {
        throw new Error(`Input is null or undefined: ${input}`);
    }
    const split: string[] = input.split(",");
    if (split.length !== 3) {
        throw Error(`Input split into length ${split.length}`);
    }
    const retVal: number[] = [0, 0, 0];
    for (let i: number = 0; i < split.length; i++) {
        const parsed: number = Number(split[i]);
        if (isNaN(parsed)) {
            throw Error(`Input split index ${i} is NaN`);
        }
        retVal[i] = parsed;
    }
    return retVal;
}