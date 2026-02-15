// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import * as rawColorDataNamed from "./colorData_named.json";
import { parseTriplet, IRawTestColorData, IRawTestColorDataItem } from "./IRawTestColorData";
import { clampChannel, normalize, denormalize } from "../normalize";
import { SRGB } from "../ISRGB";
import { SRGBNormalized } from "../ISRGBNormalized";

const colorData: IRawTestColorData = rawColorDataNamed;

const signifigantDigits: number = 10;

describe('Tests for formatColor', () => {
    test('Verify test data version', () => {
        expect(colorData.version).toBe("1.0.0");
    });

    test('clampChannel', () => {
        expect(clampChannel(300, null, null)).toBe(300);
        expect(clampChannel(300, null, 255)).toBe(255);
        expect(clampChannel(300, 301, null)).toBe(301);
        expect(clampChannel(300, 301, 255)).toBe(255);
    });

    test('normalize', () => {
        colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
            const srgbd65: number[] = parseTriplet(rawColor.srgbD65)

            const normalized: SRGBNormalized = normalize(new SRGB(rawColor.r!, rawColor.g!, rawColor.b!));

            expect(normalized.r).toBeCloseTo(srgbd65[0], signifigantDigits);
            expect(normalized.g).toBeCloseTo(srgbd65[1], signifigantDigits);
            expect(normalized.b).toBeCloseTo(srgbd65[2], signifigantDigits);
        });
    });

    test('denormalize', () => {
        colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
            const srgbd65: number[] = parseTriplet(rawColor.srgbD65)

            const denormalized: SRGB = denormalize(new SRGBNormalized(srgbd65[0], srgbd65[1], srgbd65[2]));

            expect(denormalized.r).toBe(rawColor.r);
            expect(denormalized.g).toBe(rawColor.g);
            expect(denormalized.b).toBe(rawColor.b);
        });
    });
});