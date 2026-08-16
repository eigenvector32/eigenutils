// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { ISRGB } from "./ISRGB";
import { ISRGBNormalized } from "./ISRGBNormalized";
import { ISRGBA } from "./ISRGBA";
import { ISRGBANormalized } from "./ISRGBANormalised";
import {
  clampChannel,
  denormalizeISRGBNormalized,
  denormalizeISRGBANormalized
} from "./normalize";

// Input is clamped to [0,255], rounded and output is formatted #RRGGBB
export function ISRGBToHex(input: ISRGB): string {
  let r: number = Math.round(clampChannel(input.r, 0, 255));
  let g: number = Math.round(clampChannel(input.g, 0, 255));
  let b: number = Math.round(clampChannel(input.b, 0, 255));

  return (
    "#" +
    (r < 16 ? "0" : "") +
    r.toString(16) +
    (g < 16 ? "0" : "") +
    g.toString(16) +
    (b < 16 ? "0" : "") +
    b.toString(16)
  );
}

// Input is clamped to [0,255], rounded and output is formatted #RRGGBBAA
export function ISRGBAToHex(input: ISRGBA): string {
  let r: number = Math.round(clampChannel(input.r, 0, 255));
  let g: number = Math.round(clampChannel(input.g, 0, 255));
  let b: number = Math.round(clampChannel(input.b, 0, 255));
  let a: number = Math.round(clampChannel(input.a, 0, 255));

  return (
    "#" +
    (r < 16 ? "0" : "") +
    r.toString(16) +
    (g < 16 ? "0" : "") +
    g.toString(16) +
    (b < 16 ? "0" : "") +
    b.toString(16) +
    (a < 16 ? "0" : "") +
    a.toString(16)
  );
}

// Denormalized, clamped, rounded and output is formatted #RRGGBB
export function ISRGBNormalizedToHex(input: ISRGBNormalized): string {
  return ISRGBToHex(denormalizeISRGBNormalized(input));
}

// Denormalized, clamped, rounded and output is formatted #RRGGBBAA
export function ISRGBANormalizedToHex(input: ISRGBANormalized): string {
  return ISRGBAToHex(denormalizeISRGBANormalized(input));
}
