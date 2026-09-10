// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IComplex, isIComplex, Complex } from "./IComplex";

export interface IComplexMatrix {
  // Component index [i][j] is equivalent to the mathematical notation Aij
  // so the i represents the column of the matrix and the j represents the row
  components: IComplex[][];
  readonly columns: number;
  readonly rows: number;
}

export function isIComplexMatrix(input: any): input is IComplexMatrix {
  if (input === null || input === undefined || !Array.isArray(input.components)) {
    return false;
  }
  let rowCount: number = input.components.length <= 0 ? 0 : input.components[0].length;
  for (let i: number = 0; i < input.components.length; i++) {
    if (input.components[i].length !== rowCount) {
      // Jagged matrices are not allowed
      return false;
    }
    for (let j: number = 0; j < input.components[i].length; j++) {
      if (!isIComplex(input.components[i][j])) {
        return false;
      }
    }
  }
  return true;
}

export class ComplexMatrix implements IComplexMatrix {
  constructor(columns: number = 3, rows: number = 3, value: IComplex = new Complex(0, 0)) {
    this.components = new Array<IComplex[]>(columns);
    for (let i: number = 0; i < columns; i++) {
      this.components[i] = new Array<IComplex>(rows);
      for (let j: number = 0; j < rows; j++) {
        this.components[i][j] = Complex.clone(value);
      }
    }
  }

  public components: IComplex[][];

  public get columns(): number {
    return this.components.length;
  }

  public get rows(): number {
    if (this.components.length === 0) {
      return 0;
    }
    return this.components[0].length;
  }

  public conjuate(): ComplexMatrix {
    return ComplexMatrix.conjugate(this);
  }

  public transpose(): ComplexMatrix {
    return ComplexMatrix.transpose(this);
  }

  public hermitianAdjoint(): ComplexMatrix {
    return ComplexMatrix.hermitianAdjoint(this);
  }

  public multiply(rhs: IComplexMatrix): ComplexMatrix {
    return ComplexMatrix.multiply(this, rhs);
  }

  public static conjugate(input: IComplexMatrix): ComplexMatrix {
    const retVal: ComplexMatrix = new ComplexMatrix(input.columns, input.rows);
    for (let i: number = 0; i < input.columns; i++) {
      for (let j: number = 0; j < input.rows; j++) {
        retVal.components[i][j] = Complex.conjugate(input.components[i][j]);
      }
    }
    return retVal;
  }

  public static transpose(input: IComplexMatrix): ComplexMatrix {
    const retVal: ComplexMatrix = new ComplexMatrix(input.rows, input.columns);
    for (let i: number = 0; i < input.columns; i++) {
      for (let j = 0; j < input.rows; j++) {
        retVal.components[j][i] = input.components[i][j];
      }
    }
    return retVal;
  }

  public static hermitianAdjoint(input: IComplexMatrix): ComplexMatrix {
    const retVal: ComplexMatrix = new ComplexMatrix(input.rows, input.columns);
    for (let i: number = 0; i < input.columns; i++) {
      for (let j = 0; j < input.rows; j++) {
        retVal.components[j][i] = Complex.conjugate(input.components[i][j]);
      }
    }
    return retVal;
  }

  public static multiply(lhs: IComplexMatrix, rhs: IComplexMatrix): ComplexMatrix {
    if (lhs.rows !== rhs.columns) {
      throw new Error(`Dimensions do not match between ${lhs.columns}x${lhs.rows} vs ${rhs.columns}x${rhs.rows}`);
    }
    const retVal: ComplexMatrix = new ComplexMatrix(lhs.columns, rhs.rows);
    for (let i: number = 0; i < lhs.columns; i++) {
      for (let j: number = 0; j < rhs.rows; j++) {
        let sumA: number = 0;
        let sumB: number = 0;
        for (let k: number = 0; k < lhs.rows; k++) {
          const product: Complex = Complex.multiply(lhs.components[i][k], rhs.components[k][j]);
          sumA += product.a;
          sumB += product.b;
        }
        retVal.components[i][j] = new Complex(sumA, sumB);
      }
    }
    return retVal;
  }
}
