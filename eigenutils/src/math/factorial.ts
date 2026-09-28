// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

export function integerFactorial(input: number): number {
  if (input < 0) {
    throw Error(`integerFactorial is not defined for ${input}`);
  }
  let retVal: number = 1;
  for (let i: number = 2; i <= input; i++) {
    retVal *= i;
  }
  return retVal;
}
