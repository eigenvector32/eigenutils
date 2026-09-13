// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

// Having a fixed sized matrix with a hard coded list of columns and rows is so much more effecient than a generic 
// nxm matrix class built using arrays that it is worth having this implementation.
export interface IReadonlyMatrix3x3 {
  // First row, first column
  readonly m11: number;
  // First row, second column
  readonly m12: number;
  // First row, third column
  readonly m13: number;

  // Second row, first column
  readonly m21: number;
  // Second row, second column
  readonly m22: number;
  // Second row, third column
  readonly m23: number;

  // Third row, first column
  readonly m31: number;
  // Third row, second column
  readonly m32: number;
  // Third row, third column
  readonly m33: number;
}

export function isIReadonlyMatrix3x3(input: any): input is IReadonlyMatrix3x3 {
  if (
    input === null ||
    input === undefined ||
    Number.isNaN(input.m11) ||
    Number.isNaN(input.m12) ||
    Number.isNaN(input.m13) ||
    Number.isNaN(input.m21) ||
    Number.isNaN(input.m22) ||
    Number.isNaN(input.m23) ||
    Number.isNaN(input.m31) ||
    Number.isNaN(input.m32) ||
    Number.isNaN(input.m33)
  ) {
    return false;
  }
  return true;
}

export interface IMatrix3x3 extends IReadonlyMatrix3x3 {
  // First row, first column
  m11: number;
  // First row, second column
  m12: number;
  // First row, third column
  m13: number;

  // Second row, first column
  m21: number;
  // Second row, second column
  m22: number;
  // Second row, third column
  m23: number;

  // Third row, first column
  m31: number;
  // Third row, second column
  m32: number;
  // Third row, third column
  m33: number;
}

export function isMatrix3x3(input: any): input is IMatrix3x3 {
  if (
    input === null ||
    input === undefined ||
    Number.isNaN(input.m11) ||
    Number.isNaN(input.m12) ||
    Number.isNaN(input.m13) ||
    Number.isNaN(input.m21) ||
    Number.isNaN(input.m22) ||
    Number.isNaN(input.m23) ||
    Number.isNaN(input.m31) ||
    Number.isNaN(input.m32) ||
    Number.isNaN(input.m33)
  ) {
    return false;
  }
  return true;
}
