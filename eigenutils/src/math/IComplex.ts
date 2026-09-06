// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

export interface IReadonlyComplex {
  readonly a: number;
  readonly b: number;
}

export function isIReadonlyComplex(input: any): input is IReadonlyComplex {
  if (input === null || input === undefined || Number.isNaN(input.x) || Number.isNaN(input.y)) {
    return false;
  }
  return true;
}

export interface IComplex extends IReadonlyComplex {
  a: number;
  b: number;
}

export function isIComplex(input: any): input is IComplex {
  if (input === null || input === undefined || Number.isNaN(input.x) || Number.isNaN(input.y)) {
    return false;
  }
  return true;
}

export function add(lhs: IReadonlyComplex, rhs: IReadonlyComplex): IComplex {
  return {
    a: lhs.a + rhs.a,
    b: lhs.b + rhs.b,
  };
}

export function subtract(lhs: IReadonlyComplex, rhs: IReadonlyComplex): IComplex {
  return {
    a: lhs.a - rhs.a,
    b: lhs.b - rhs.b,
  };
}

export function multiply(lhs: IReadonlyComplex, rhs: IReadonlyComplex): IComplex {
  return {
    a: lhs.a * rhs.a - lhs.b * rhs.b,
    b: lhs.a * rhs.b + lhs.b * rhs.a,
  };
}

export function divide(lhs: IReadonlyComplex, rhs: IReadonlyComplex): IComplex {
  const denominator: number = Math.pow(rhs.a, 2) + Math.pow(rhs.b, 2);
  return {
    a: (lhs.a * rhs.a + lhs.b + rhs.b) / denominator,
    b: (lhs.b * rhs.a - lhs.a * rhs.b) / denominator,
  };
}

export function conjugate(input: IReadonlyComplex): IComplex {
  return {
    a: input.a,
    b: -1 * input.b,
  };
}
