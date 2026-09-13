// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IComplex, isIComplex, Complex } from "./IComplex";
import { ComplexRowVector, IComplexRowVector } from "./IComplexRowVector";
import { ComplexVector, IComplexVector } from "./IComplexVector";

export interface IComplexMatrix {
  // Component index [i][j] is equivalent to the mathematical notation Aij
  // so the i represents the row of the matrix and the j represents the column
  // this is backwards from how I would naturally think of it so pay careful attention to indices
  components: IComplex[][];
  readonly columns: number;
  readonly rows: number;
}

export function isIComplexMatrix(input: any): input is IComplexMatrix {
  if (input === null || input === undefined || !Array.isArray(input.components)) {
    return false;
  }
  let columnCount: number = input.components.length <= 0 ? 0 : input.components[0].length;
  for (let i: number = 0; i < input.components.length; i++) {
    if (input.components[i].length !== columnCount) {
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
  constructor();
  constructor(components: IComplex[][]);
  // Equivalent to normal math notation which puts rows first
  constructor(rows: number, columns: number, value?: IComplex);
  constructor(a?: IComplex[][] | number, b?: number, c?: IComplex) {
    if (Array.isArray(a)) {
      if (a.length === 0) {
        this.components = [];
        return;
      }
      const rowLength: number = a[0].length;
      // First just validate the incoming data
      for (let i: number = 0; i < rowLength; i++) {
        const row: IComplex[] = a[i];
        if (!Array.isArray(row)) {
          throw new Error("Invalid complex matrix components");
        }
        if (row.length !== rowLength) {
          throw new Error("Jagged matrices are not supported");
        }
        for (let j: number = 0; j < row.length; j++) {
          if (!isIComplex(row[j])) {
            throw new Error("Invalid complex matrix components");
          }
        }
      }
      // Now actually copy it into this.components
      this.components = new Array<IComplex[]>(a.length);
      for (let i: number = 0; i < a.length; i++) {
        const row: IComplex[] = a[i];
        this.components[i] = new Array<IComplex>(row.length);
        for (let j: number = 0; j < row.length; j++) {
          this.components[i][j] = Complex.clone(row[j]);
        }
      }
      return;
    }
    let rows: number = 3;
    let columns: number = 3;
    let value: IComplex = new Complex(0, 0);
    if (typeof a === "number") {
      rows = a;
    }
    if (typeof b === "number") {
      columns = b;
    }
    if (isIComplex(c)) {
      value = c;
    }
    this.components = new Array<IComplex[]>(rows);
    for (let i: number = 0; i < rows; i++) {
      this.components[i] = new Array<IComplex>(columns);
      for (let j: number = 0; j < columns; j++) {
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

  public clone(): ComplexMatrix {
    return ComplexMatrix.clone(this);
  }

  public conjugate(): ComplexMatrix {
    return ComplexMatrix.conjugate(this);
  }

  public transpose(): ComplexMatrix {
    return ComplexMatrix.transpose(this);
  }

  public hermitianAdjoint(): ComplexMatrix {
    return ComplexMatrix.hermitianAdjoint(this);
  }

  public add(rhs: IComplexMatrix): ComplexMatrix {
    return ComplexMatrix.add(this, rhs);
  }

  public multiply(rhs: IComplexMatrix): ComplexMatrix {
    return ComplexMatrix.multiply(this, rhs);
  }

  public columnVectorProduct(rhs: IComplexVector): ComplexVector {
    return ComplexMatrix.columnVectorProduct(this, rhs);
  }

  public rowVectorProduct(rhs: IComplexRowVector): ComplexRowVector {
    return ComplexMatrix.rowVectorProduct(this, rhs);
  }

  public static clone(input: IComplexMatrix): ComplexMatrix {
    return new ComplexMatrix(input.components);
  }

  public static scale(scalar: number | IComplex, input: IComplexMatrix): ComplexMatrix {
    if (input.components.length === 0) {
      return new ComplexMatrix(0, 0);
    }
    const retVal: ComplexMatrix = new ComplexMatrix(input.rows, input.columns);
    for (let i: number = 0; i < retVal.rows; i++) {
      for (let j: number = 0; j < retVal.columns; j++) {
        retVal.components[i][j] = Complex.multiply(scalar, input.components[i][j]);
      }
    }
    return retVal;
  }

  public static conjugate(input: IComplexMatrix): ComplexMatrix {
    const retVal: ComplexMatrix = new ComplexMatrix(input.rows, input.columns);
    for (let i: number = 0; i < input.rows; i++) {
      for (let j: number = 0; j < input.columns; j++) {
        retVal.components[i][j] = Complex.conjugate(input.components[i][j]);
      }
    }
    return retVal;
  }

  public static transpose(input: IComplexMatrix): ComplexMatrix {
    // Note the transpose of a non-square matrix swaps the width and height
    const retVal: ComplexMatrix = new ComplexMatrix(input.columns, input.rows);
    for (let j = 0; j < input.columns; j++) {
      for (let i = 0; i < input.rows; i++) {
        retVal.components[j][i] = input.components[i][j];
      }
    }
    return retVal;
  }

  public static hermitianAdjoint(input: IComplexMatrix): ComplexMatrix {
    // Note the transpose of a non-square matrix swaps the width and height
    const retVal: ComplexMatrix = new ComplexMatrix(input.columns, input.rows);
    for (let j = 0; j < input.columns; j++) {
      for (let i = 0; i < input.rows; i++) {
        retVal.components[j][i] = Complex.conjugate(input.components[i][j]);
      }
    }
    return retVal;
  }

  public static add(lhs: IComplexMatrix, rhs: IComplexMatrix): ComplexMatrix {
    if (lhs.rows !== rhs.rows || lhs.columns !== rhs.columns) {
      throw new Error(`Dimensions do not match between ${lhs.rows}x${lhs.columns} vs ${rhs.rows}x${rhs.columns}`);
    }
    const retVal: ComplexMatrix = new ComplexMatrix(lhs.columns, lhs.rows);
    for (let i: number = 0; i < retVal.rows; i++) {
      for (let j: number = 0; j < retVal.columns; j++) {
        retVal.components[i][j] = Complex.add(lhs.components[i][j], rhs.components[i][j]);
      }
    }
    return retVal;
  }

  public static multiply(lhs: IComplexMatrix, rhs: IComplexMatrix): ComplexMatrix {
    if (lhs.columns !== rhs.rows) {
      throw new Error(`Dimensions do not match between ${lhs.rows}x${lhs.columns} vs ${rhs.rows}x${rhs.columns}`);
    }
    const retVal: ComplexMatrix = new ComplexMatrix(lhs.rows, rhs.columns);
    for (let i: number = 0; i < retVal.rows; i++) {
      for (let j: number = 0; j < retVal.columns; j++) {
        const sum: Complex = new Complex(0, 0);
        for (let k: number = 0; k < lhs.columns; k++) {
          sum.addAssign(Complex.multiply(lhs.components[i][k], rhs.components[k][j]));
        }
        retVal.components[i][j] = sum;
      }
    }
    return retVal;
  }

  public static columnVectorProduct(lhs: IComplexMatrix, rhs: IComplexVector): ComplexVector {
    if (lhs.columns !== rhs.components.length) {
      throw new Error(`Dimensions do not match between ${lhs.rows}x${lhs.columns} vs ${rhs.components.length}`);
    }
    const retVal: ComplexVector = new ComplexVector(lhs.rows);
    for (let i: number = 0; i < lhs.rows; i++) {
      const sum: Complex = new Complex(0, 0);
      for (let j: number = 0; j < lhs.columns; j++) {
        sum.addAssign(Complex.multiply(lhs.components[i][j], rhs.components[j]));
      }
      retVal.components[i] = sum;
    }
    return retVal;
  }

  public static rowVectorProduct(lhs: IComplexMatrix, rhs: IComplexRowVector): ComplexRowVector {
    if (lhs.rows != rhs.components.length) {
      throw new Error(`Dimensions do not match between ${lhs.rows}x${lhs.columns} vs ${rhs.components.length}`);
    }
    const retVal: ComplexRowVector = new ComplexRowVector(lhs.columns);
    for (let j: number = 0; j < lhs.columns; j++) {
      const sum: Complex = new Complex(0, 0);
      for (let i: number = 0; lhs.rows; i++) {
        sum.addAssign(Complex.multiply(lhs.components[i][j], rhs.components[i]));
      }
    }
    return retVal;
  }
}
