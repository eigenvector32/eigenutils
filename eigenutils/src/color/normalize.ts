// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { ISRGB, SRGB } from "./ISRGB";
import { ISRGBNormalized, SRGBNormalized } from "./ISRGBNormalized";

export function clampChannel(input: number, min: number | null = null,  max: number | null = null): number {
    if (max !== null && input > max) {
        return max;
    }
    if (min !== null && input < min) {
        return min;
    }
    return input;
}

export function normalize(input: ISRGB, clampInput: boolean = false): SRGBNormalized {
    if (clampInput) {
        return new SRGBNormalized(clampChannel(input.r, 0, 255) / 255, clampChannel(input.g, 0, 255) / 255, clampChannel(input.b, 0, 255) / 255);
    }
    else {
        return new SRGBNormalized(input.r / 255, input.g / 255, input.b / 255);
    }
}

export function denormalize(input: ISRGBNormalized, clampInput: boolean = false): SRGB {
    if (clampInput) {
        return new SRGB(clampChannel(input.r, 0, 1) * 255, clampChannel(input.g, 0, 1) * 255, clampChannel(input.b * 255, 0, 1));
    }
    else {
        return new SRGB(input.r * 255, input.g * 255, input.b * 255);
    }
}