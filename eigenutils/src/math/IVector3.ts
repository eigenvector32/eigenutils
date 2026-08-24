// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

export interface IReadonlyVector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export function isIReadonlyVector3(input: any): input is IReadonlyVector3 {
  if (input === null || input === undefined || Number.isNaN(input.x) || Number.isNaN(input.y) || Number.isNaN(input.z)) {
    return false;
  }
  return true;
}

export interface IVector3 extends IReadonlyVector3 {
  x: number;
  y: number;
  z: number;
}

export function isIVector3(input: any): input is IVector3 {
  if (input === null || input === undefined || Number.isNaN(input.x) || Number.isNaN(input.y) || Number.isNaN(input.z)) {
    return false;
  }
  return true;
}
