// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { SRGB } from "./ISRGB";
import { SRGBNormalized } from "./ISRGBNormalized";
import { SRGBA } from "./ISRGBA";
import { SRGBANormalized } from "./ISRGBANormalised";
import { normalizeISRGB, normalizeISRGBA } from "./normalize";

// Input must be a string of the form "RRGGBB", "#RRGGBB", "RGB", "#RGB"
export function parseHexRGBToSRGB(input: string): SRGB {
  if (input.startsWith("#")) {
    input = input.slice(1);
  }
  if (input.length === 3) {
    const r: number = Number.parseInt(input[0], 16);
    if (isNaN(r)) {
      throw new Error(`Input index 0 is not a number ${input}`);
    }
    const g: number = Number.parseInt(input[1], 16);
    if (isNaN(g)) {
      throw new Error(`Input index 1 is not a number ${input}`);
    }
    const b: number = Number.parseInt(input[2], 16);
    if (isNaN(b)) {
      throw new Error(`Input index 2 is not a number ${input}`);
    }
    return new SRGB(r, g, b);
  } else if (input.length === 6) {
    const parsedInput: number = Number.parseInt(input, 16);
    if (isNaN(parsedInput)) {
      throw new Error(`Input is not a number ${input}`);
    }
    const r: number = (parsedInput & 0xff0000) >> 16;
    const g: number = (parsedInput & 0x00ff00) >> 8;
    const b: number = parsedInput & 0x0000ff;
    return new SRGB(r, g, b);
  } else {
    throw new Error(`Invalid input length ${input}`);
  }
}

// Input must be a string of the form "RRGGBBAA", "#RRGGBBAA", "RGBA", "#RGBA"
export function parseHexRGBAToSRGBA(input: string): SRGBA {
  if (input.startsWith("#")) {
    input = input.slice(1);
  }
  if (input.length === 4) {
    const r: number = Number.parseInt(input[0], 16);
    if (isNaN(r)) {
      throw new Error(`Input index 0 is not a number ${input}`);
    }
    const g: number = Number.parseInt(input[1], 16);
    if (isNaN(g)) {
      throw new Error(`Input index 1 is not a number ${input}`);
    }
    const b: number = Number.parseInt(input[2], 16);
    if (isNaN(b)) {
      throw new Error(`Input index 2 is not a number ${input}`);
    }
    const a: number = Number.parseInt(input[3], 16);
    if (isNaN(a)) {
      throw new Error(`Input index 3 is not a number ${input}`);
    }
    return new SRGBA(r, g, b, a);
  } else if (input.length === 8) {
    const parsedInput: number = Number.parseInt(input, 16);
    if (isNaN(parsedInput)) {
      throw new Error(`Input is not a number ${input}`);
    }
    const r: number = (parsedInput & 0xff000000) >> 24;
    const g: number = (parsedInput & 0x00ff0000) >> 16;
    const b: number = (parsedInput & 0x0000ff00) >> 8;
    const a: number = parsedInput & 0x000000ff;
    return new SRGBA(r, g, b, a);
  } else {
    throw new Error(`Invalid input length ${input}`);
  }
}

// Input must be a string of the form "RRGGBB", "#RRGGBB", "RGB", "#RGB"
export function parseHexRGBToSRGBNormalized(input: string): SRGBNormalized {
  return normalizeISRGB(parseHexRGBToSRGB(input));
}

// Input must be a string of the form "RRGGBB", "#RRGGBB", "RGB", "#RGB"
export function parseHexRGBAToSRGBANormalized(input: string): SRGBANormalized {
  return normalizeISRGBA(parseHexRGBAToSRGBA(input));
}
