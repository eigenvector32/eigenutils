import * as rawColorDataNamed from "./colorData_named.json";
import { parseTriplet, IRawTestColorData, IRawTestColorDataItem } from "./IRawTestColorData";
import { parseHexRGBToSRGB } from "../parseColor";
import { SRGB } from "../ISRGB";

const colorData: IRawTestColorData = rawColorDataNamed;

describe('Tests for parseColor', () => {
    test('Verify test data version', () => {
        console.log(rawColorDataNamed);
        expect(colorData.version).toBe("1.0.0");
    });

    test('parseHexRGBToSRGB', () => {
        colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
            expect(rawColor.hex).toBeDefined();

            const parsed:SRGB = parseHexRGBToSRGB(rawColor.hex!);

            expect(parsed.r).toBe(rawColor.r);
            expect(parsed.g).toBe(rawColor.g);
            expect(parsed.b).toBe(rawColor.b);
        });
    });
});
