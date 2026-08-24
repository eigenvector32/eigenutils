// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

// https://en.wikipedia.org/wiki/SRGB#Transfer_function_(%22gamma%22)

export function normalizedSRGBToLinearRGBChannel(input: number): number {
  if (input <= 0.04045) {
    return input / 12.92;
  } else {
    return Math.pow((input + 0.055) / 1.055, 2.4);
  }
}

export function linearRGBToNormalizedSRGBChannel(input: number): number {
  if (input <= 0.0031308) {
    return input * 12.92;
  } else {
    return 1.055 * Math.pow(input, 1.0 / 2.4) - 0.055;
  }
}
