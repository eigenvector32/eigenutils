export interface IRawTestColorData {
    version: string;
    data: IRawTestColorDataItem[];
}

export interface IRawTestColorDataItem {
    // "r": 240,
    // "g": 248,
    // "b": 255,
    // "hex": "#f0f8ff",
    // "name": "aliceblue",
    // "xyzD65": "0.8754838872419908,0.928797585535664,1.079262830765516",
    // "xyzD50": "0.8845879989465368,0.9274246566837672,0.8173610577050107",
    // "labD65": "97.17878181330616,-1.3479209632671907,-4.262766679007757",
    // "labD50": "97.12298815661252,-1.7736176003238513,-4.332736049298114",
    // "srgbD65": "0.9411764705882353,0.9725490196078431,1",
    // "srgbLinearD65": "0.8713671191987972,0.938685728457888,1",
    // "luvD65": "97.17878181330616,-4.757348467806607,-6.424466312795887",
    // "oklabD65": "0.9751428613835261,-0.005500548386183579,-0.011404205458968253",
    // "lchuvD65": "97.17878181330616,7.994131087766266,233.47987263460863",
    // "oklchD65": "0.9751428613835261,0.01266143493839099,244.25076353753207",
    // "lchD50": "97.12298815661252,4.681700659489665,247.73812384815494",
    // "hslD65": "208,100,97.05882352941177",
    // "hsvD65": "208,5.882352941176472,100",
    // "hsluvD65": "233.47987263460863,100.00000000000246,97.17878181330616"
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