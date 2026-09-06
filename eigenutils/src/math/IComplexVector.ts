// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IComplex, isIComplex } from "./IComplex";

export interface IComplexVector {
  components: IComplex[];
}

export function isIComplexVector(input: any): input is IComplexVector {
  if (input === null || input === undefined || !Array.isArray(input.components)) {
    return false;
  }
  for (let i: number = 0; i < input.components.length; i++) {
    if (!isIComplex(input.components[i])) {
      return false;
    }
  }
  return true;
}
