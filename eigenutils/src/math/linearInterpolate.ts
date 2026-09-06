// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

export function linearInterpolate(scalar: number, domainA: number, domainB: number): number {
  // Smooth off floating point jaggies by handling these cases separately
  if (scalar <= 0) {
    return domainA;
  }
  if (scalar >= 1) {
    return domainB;
  }
  return (domainB - domainA) * scalar + domainA;
}
