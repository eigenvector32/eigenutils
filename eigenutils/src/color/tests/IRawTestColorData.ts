// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

export interface IRawTestColorData {
  version: string;
  data: IRawTestColorDataItem[];
}

export interface IRawTestColorDataItem {
  name?: string;
  hexRGB: string;
  adobergb: string;
  ciexyy: string;
  cmyk: string;
  hpluv: string;
  hsi: string;
  hsl: string;
  hsluv: string;
  hsv: string;
  hwb: string;
  labd50: string;
  labd65: string;
  lch: string;
  oklab: string;
  oklch: string;
  rgb: string;
  rgbnormalized:string;
  srgb: string;
  xyzd50: string;
  xyzd65: string;
  yuv: string;
}

export function parseArray(
  input?: string | null,
  expectedLength: number = 3
): number[] {
  if (input === undefined || input === null) {
    throw new Error(`Input is null or undefined: ${input}`);
  }
  const split: string[] = input.split(",");
  if (split.length !== expectedLength) {
    throw Error(
      `Input split into length ${split.length} but expected ${expectedLength}`
    );
  }
  const retVal: number[] = new Array<number>(expectedLength);
  for (let i: number = 0; i < split.length; i++) {
    const parsed: number = Number(split[i]);
    if (isNaN(parsed)) {
      throw Error(`Input split index ${i} is NaN`);
    }
    retVal[i] = parsed;
  }
  return retVal;
}
