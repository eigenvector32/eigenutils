// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { ISRGB, SRGB } from "./ISRGB";
import { ISRGBA, SRGBA } from "./ISRGBA";
import { ISRGBNormalized, SRGBNormalized } from "./ISRGBNormalized";
import { ISRGBANormalized, SRGBANormalized } from "./ISRGBANormalised";

export function clampChannel(
  input: number,
  min: number | null = null,
  max: number | null = null
): number {
  if (max !== null && input > max) {
    return max;
  }
  if (min !== null && input < min) {
    return min;
  }
  return input;
}

export function normalizeISRGB(
  input: ISRGB,
  clampInput: boolean = false
): SRGBNormalized {
  if (clampInput) {
    return new SRGBNormalized(
      clampChannel(input.r, 0, 255) / 255,
      clampChannel(input.g, 0, 255) / 255,
      clampChannel(input.b, 0, 255) / 255
    );
  } else {
    return new SRGBNormalized(input.r / 255, input.g / 255, input.b / 255);
  }
}

export function normalizeISRGBA(
  input: ISRGBA,
  clampInput: boolean = false
): SRGBANormalized {
  if (clampInput) {
    return new SRGBANormalized(
      clampChannel(input.r, 0, 255) / 255,
      clampChannel(input.g, 0, 255) / 255,
      clampChannel(input.b, 0, 255) / 255,
      clampChannel(input.a, 0, 255) / 255
    );
  } else {
    return new SRGBANormalized(
      input.r / 255,
      input.g / 255,
      input.b / 255,
      input.a / 255
    );
  }
}

export function denormalizeISRGBNormalized(
  input: ISRGBNormalized,
  clampInput: boolean = false
): SRGB {
  if (clampInput) {
    return new SRGB(
      clampChannel(input.r, 0, 1) * 255,
      clampChannel(input.g, 0, 1) * 255,
      clampChannel(input.b, 0, 1) * 255
    );
  } else {
    return new SRGB(input.r * 255, input.g * 255, input.b * 255);
  }
}

export function denormalizeISRGBANormalized(
  input: ISRGBANormalized,
  clampInput: boolean = false
): SRGBA {
  if (clampInput) {
    return new SRGBA(
      clampChannel(input.r, 0, 1) * 255,
      clampChannel(input.g, 0, 1) * 255,
      clampChannel(input.b, 0, 1) * 255,
      clampChannel(input.a, 0, 1) * 255
    );
  } else {
    return new SRGBA(
      input.r * 255,
      input.g * 255,
      input.b * 255,
      input.a * 255
    );
  }
}
