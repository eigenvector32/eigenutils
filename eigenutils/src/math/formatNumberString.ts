// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IComplex } from "./IComplex";
import { IComplexMatrix } from "./IComplexMatrix";
import { IComplexVector } from "./IComplexVector";
import { IComplexRowVector } from "./IComplexRowVector";

export const wellKnownConstants: Map<number, string> = new Map<number, string>([
  [1 / 2, "½"],
  [1 / 3, "⅓"],
  [2 / 3, "⅔"],
  [1 / 4, "¼"],
  [3 / 4, "¾"],
  [Math.sqrt(2), "√2"],
  [2 * Math.sqrt(2), "2√2"],
  [3 * Math.sqrt(2), "3√2"],
  [4 * Math.sqrt(2), "4√2"],
  [1 / Math.sqrt(2), "1/√2"],
  [2 / Math.sqrt(2), "2/√2"],
  [3 / Math.sqrt(2), "3/√2"],
  [4 / Math.sqrt(2), "4/√2"],
  [1 / (2 * Math.sqrt(2)), "1/2√2"],
  [1 / (3 * Math.sqrt(2)), "1/3√2"],
  [2 / (3 * Math.sqrt(2)), "2/3√2"],
  [1 / (4 * Math.sqrt(2)), "1/4√2"],
  [3 / (4 * Math.sqrt(2)), "3/4√2"],
  [Math.sqrt(2) / 2, "√2/2"],
  [Math.sqrt(2) / 3, "√2/3"],
  [Math.sqrt(2) / 4, "√2/4"],
  [Math.sqrt(3), "√3"],
  [1 / Math.sqrt(3), "1/√3"],
  [2 / Math.sqrt(3), "2/√3"],
  [3 / Math.sqrt(3), "3/√3"],
  [4 / Math.sqrt(3), "4/√3"],
  [1 / (2 * Math.sqrt(3)), "1/2√3"],
  [1 / (3 * Math.sqrt(3)), "1/3√3"],
  [2 / (3 * Math.sqrt(3)), "2/3√3"],
  [1 / (4 * Math.sqrt(3)), "1/4√3"],
  [3 / (4 * Math.sqrt(3)), "3/4√3"],
  [Math.sqrt(3) / 2, "√3/2"],
  [Math.sqrt(3) / 3, "√3/3"],
  [Math.sqrt(3) / 4, "√3/4"],
  [Math.PI, "π"],
  [2 * Math.PI, "2π"],
  [Math.PI / 2, "½π"],
  [Math.PI / 3, "⅓π"],
  [(2 * Math.PI) / 3, "⅔π"],
  [Math.PI / 4, "¼π"],
  [(3 * Math.PI) / 4, "¾π"],
  [Math.E, "ⅇ"]
]);

export function formatRealNumber(input: number, fractionDigits: number | null = null, epsilon: number = 0.000001): string {
  if (Math.abs(input) < epsilon) {
    return "0";
  }

  const absInput: number = Math.abs(input);
  const wellKnownKeys: MapIterator<number> = wellKnownConstants.keys();
  let wellKnownKey: number | null = null;
  for (const c of wellKnownKeys) {
    if (Math.abs(absInput - c) < epsilon) {
      wellKnownKey = c;
      break;
    }
  }
  if (wellKnownKey !== null) {
    const retVal: string | undefined = wellKnownConstants.get(wellKnownKey);
    if (retVal === undefined) {
      throw new Error("A known good key was not found in wellKnownConstants");
    }
    if (input < 0) {
      return "-" + retVal;
    } else {
      return retVal;
    }
  }

  if (fractionDigits === null) {
    return input.toString();
  }
  return input.toFixed(fractionDigits);
}

export function formatComplexNumber(input: IComplex, fractionDigits: number | null = null, epsilon: number = 0.000001): string {
  const real: string = formatRealNumber(input.a, fractionDigits, epsilon);
  if (Math.abs(input.b) < epsilon) {
    return real;
  }
  let complex: string = "";
  if (Math.abs(Math.abs(input.b) - 1) < epsilon) {
    if (input.b < 0) {
      complex = "-i";
    } else {
      complex = "i";
    }
  } else {
    complex = formatRealNumber(input.b, fractionDigits, epsilon) + "i";
  }
  if (Math.abs(input.a) < epsilon) {
    return complex;
  }
  return real + "+" + complex;
}

export function formatComplexVector(input: IComplexVector, fractionDigits: number | null = null, epsilon: number = 0.000001): string {
  if (input.components.length === 0) {
    return "()";
  }
  if (input.components.length === 1) {
    return "(" + formatComplexNumber(input.components[0], fractionDigits, epsilon) + ")";
  }

  const rawStrings: string[] = new Array<string>(input.components.length);
  let maxLength: number = 0;
  for (let i: number = 0; i < input.components.length; i++) {
    rawStrings[i] = formatComplexNumber(input.components[i], fractionDigits, epsilon);
    maxLength = Math.max(maxLength, rawStrings[i].length);
  }
  for (let i: number = 0; i < rawStrings.length; i++) {
    if (i === 0) {
      rawStrings[i] = "⎛" + rawStrings[i].padStart(maxLength, " ") + "⎞";
    } else if (i === rawStrings.length - 1) {
      rawStrings[i] = "⎝" + rawStrings[i].padStart(maxLength, " ") + "⎠";
    } else {
      rawStrings[i] = "⎜" + rawStrings[i].padStart(maxLength, " ") + "⎟";
    }
  }
  return rawStrings.join("\n");
}

export function formatComplexRowVector(input: IComplexRowVector, fractionDigits: number | null = null, epsilon: number = 0.000001): string {
  if (input.components.length === 0) {
    return "()";
  }
  const retVal: string[] = ["("];
  for (let i: number = 0; i < input.components.length; i++) {
    retVal.push(formatComplexNumber(input.components[i], fractionDigits, epsilon));
    if (i < input.components.length - 1) {
      retVal.push(" ");
    }
  }
  retVal.push(")");
  return retVal.join("");
}

export function formatComplexMatrix(input: IComplexMatrix, fractionDigits: number | null = null, epsilon: number = 0.000001): string {
  if (input.columns === 0 || input.rows === 0) {
    return "[]";
  }
  const columnWidths: number[] = new Array<number>(input.columns);
  for (let j: number = 0; j < input.columns; j++) {
    columnWidths[j] = 0;
  }
  const rawStrings: string[][] = new Array<string[]>(input.rows);
  for (let i: number = 0; i < input.rows; i++) {
    rawStrings[i] = new Array<string>(input.columns);
    for (let j = 0; j < input.columns; j++) {
      rawStrings[i][j] = formatComplexNumber(input.components[i][j], fractionDigits, epsilon);
      columnWidths[j] = Math.max(columnWidths[j], rawStrings[i][j].length);
    }
  }

  const outputCells: string[][] = [];
  const outputRows: string[] = new Array<string>(rawStrings.length);
  for (let i: number = 0; i < rawStrings.length; i++) {
    outputCells[i] = [];
    if (i === 0) {
      outputCells[i].push("⎡");
    } else if (i === rawStrings.length - 1) {
      outputCells[i].push("⎣");
    } else {
      outputCells[i].push("⎢");
    }

    for (let j: number = 0; j < rawStrings[i].length; j++) {
      outputCells[i].push(rawStrings[i][j].padStart(columnWidths[j]));
      if (j < rawStrings[i].length - 1) {
        outputCells[i].push(" ");
      }
    }

    if (i === 0) {
      outputCells[i].push("⎤");
    } else if (i === rawStrings.length - 1) {
      outputCells[i].push("⎦");
    } else {
      outputCells[i].push("⎥");
    }

    outputRows[i] = outputCells[i].join("");
  }

  return outputRows.join("\n");
}
