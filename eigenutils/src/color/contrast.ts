// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { ISRGBNormalized, SRGBNormalized } from "./ISRGBNormalized";
import { parseHexRGBToSRGBNormalized } from "./parseColor";
import { ISRGBNormalizedToHex } from "./formatColor";

// https://www.w3.org/TR/WCAG20/#relativeluminancedef
// Note that the above definition contains an error in the transform to linear RGB as specified here: https://www.w3.org/WAI/GL/wiki/Relative_luminance
// In this code the correct value is used.
// Input needs to be normalized to the range [0,1] for valid sRGB colors
export function linearizeChannel(input: number): number {
    if (input < 0.04045) {
        return input / 12.92;
    }
    else {
        return Math.pow((input + 0.055) / 1.055, 2.4);
    }
}

export function relativeLuminance(input: ISRGBNormalized): number {
    const lr: number = linearizeChannel(input.r);
    const lg: number = linearizeChannel(input.g);
    const lb: number = linearizeChannel(input.b);
    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

export function contrast(lhs: ISRGBNormalized, rhs: ISRGBNormalized): number {
    const lhsLum: number = relativeLuminance(lhs);
    const rhsLum: number = relativeLuminance(rhs);

    if (lhsLum === rhsLum) {
        return 1;
    }
    else if (lhsLum > rhsLum) {
        return (lhsLum + 0.05) / (rhsLum + 0.05);
    }
    else {
        return (rhsLum + 0.05) / (lhsLum + 0.05);
    }
}

export function selectBestContrast(testColor: ISRGBNormalized, options: ISRGBNormalized[]): ISRGBNormalized {
    if (options.length === 0) {
        throw new Error(`Empty array passed as options`);
    }
    let bestIndex: number = -1;
    let bestContrast: number = 0;
    for (let i: number = 0; i < options.length; i++) {
        const c: number = contrast(testColor, options[i]);
        if (c > bestContrast) {
            bestIndex = i;
            bestContrast = c;
        }
    }
    return options[bestIndex];
}

export const defaultContrastColors: ISRGBNormalized[] = [new SRGBNormalized(0, 0, 0), new SRGBNormalized(1, 1, 1)];

export function selectBestContrastWeb(testColor: string): string {
    const parsedTestColor: SRGBNormalized = parseHexRGBToSRGBNormalized(testColor);
    const contrastColor: ISRGBNormalized = selectBestContrast(parsedTestColor, defaultContrastColors);
    return ISRGBNormalizedToHex(contrastColor);
}
