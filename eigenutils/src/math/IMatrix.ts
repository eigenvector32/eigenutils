// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { Vector, IVector } from "./IVector";
import { RowVector, IRowVector } from "./IRowVector";

export interface IMatrix {
  // Component index [i][j] is equivalent to the mathematical notation Aij
  // so the i represents the row of the matrix and the j represents the column
  // this is backwards from how I would naturally think of it so pay careful attention to indices
  components: number[][];
  readonly columns: number;
  readonly rows: number;
}

export function isIMatrix(input: any): input is IMatrix {
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
      if (typeof input.components[i][j] !== "number") {
        return false;
      }
    }
  }
  return true;
}

export class Matrix implements IMatrix {
  constructor();
  constructor(components: number[][]);
  // Equivalent to normal math notation which puts rows first
  constructor(rows: number, columns: number, value?: number);
  constructor(a?: number[][] | number, b?: number, c?: number) {
    if (Array.isArray(a)) {
      if (a.length === 0) {
        this.components = [];
        return;
      }
      const rowLength: number = a[0].length;
      // First just validate the incoming data
      for (let i: number = 0; i < rowLength; i++) {
        const row: number[] = a[i];
        if (!Array.isArray(row)) {
          throw new Error("Invalid matrix components");
        }
        if (row.length !== rowLength) {
          throw new Error("Jagged matrices are not supported");
        }
        for (let j: number = 0; j < row.length; j++) {
          if (typeof row[j] !== "number") {
            throw new Error("Invalid matrix components");
          }
        }
      }
      // Now actually copy it into this.components
      this.components = new Array<number[]>(a.length);
      for (let i: number = 0; i < a.length; i++) {
        const row: number[] = a[i];
        this.components[i] = new Array<number>(row.length);
        for (let j: number = 0; j < row.length; j++) {
          this.components[i][j] = row[j];
        }
      }
      return;
    }
    let rows: number = 3;
    let columns: number = 3;
    let value: number = 0;
    if (typeof a === "number") {
      rows = a;
    }
    if (typeof b === "number") {
      columns = b;
    }
    if (typeof c === "number") {
      value = c;
    }
    this.components = new Array<number[]>(rows);
    for (let i: number = 0; i < rows; i++) {
      this.components[i] = new Array<number>(columns);
      for (let j: number = 0; j < columns; j++) {
        this.components[i][j] = value;
      }
    }
  }

  public components: number[][];

  public get columns(): number {
    return this.components.length;
  }

  public get rows(): number {
    if (this.components.length === 0) {
      return 0;
    }
    return this.components[0].length;
  }

  public clone(): Matrix {
    return Matrix.clone(this);
  }

  public assign(rhs: IMatrix): void {
    if (this.rows !== rhs.rows || this.columns !== rhs.columns) {
      throw new Error(`Dimensions do not match between ${this.rows}x${this.columns} vs ${rhs.rows}x${rhs.columns}`);
    }
    for (let i: number = 0; i < this.rows; i++) {
      for (let j: number = 0; j < this.columns; j++) {
        this.components[i][j] = rhs.components[i][j];
      }
    }
  }

  public scale(scalar: number): Matrix {
    return Matrix.scale(scalar, this);
  }

  public transpose(): Matrix {
    return Matrix.transpose(this);
  }

  public add(rhs: IMatrix): Matrix {
    return Matrix.add(this, rhs);
  }

  public addAssign(rhs: IMatrix): void {
    const sum: Matrix = this.add(rhs);
    this.assign(sum);
  }

  public subtract(rhs: IMatrix): Matrix {
    return Matrix.subtract(this, rhs);
  }

  public subtractAssign(rhs: IMatrix): void {
    const difference: Matrix = this.subtract(rhs);
    this.assign(difference);
  }

  public multiply(rhs: IMatrix): Matrix {
    return Matrix.multiply(this, rhs);
  }

  public multiplyAssign(rhs: IMatrix): void {
    const product: Matrix = this.multiply(rhs);
    this.assign(product);
  }

  public columnVectorProduct(rhs: IVector): Vector {
    return Matrix.columnVectorProduct(this, rhs);
  }

  public rowVectorProduct(rhs: IRowVector): RowVector {
    return Matrix.rowVectorProduct(this, rhs);
  }

  public convertColumnToVector(column: number): Vector {
    return Matrix.convertColumnToVector(this, column);
  }

  public convertRowToVector(row: number): RowVector {
    return Matrix.convertRowToVector(this, row);
  }

  public trace(): number {
    return Matrix.trace(this);
  }

  public integerPower(power: number): Matrix {
    return Matrix.integerPower(this, power);
  }

  public static clone(input: IMatrix): Matrix {
    return new Matrix(input.components);
  }

  public static scale(scalar: number, input: IMatrix): Matrix {
    if (input.columns === 0 || input.rows === 0) {
      return new Matrix(0, 0);
    }
    const retVal: Matrix = new Matrix(input.rows, input.columns);
    for (let i: number = 0; i < retVal.rows; i++) {
      for (let j: number = 0; j < retVal.columns; j++) {
        retVal.components[i][j] = scalar * input.components[i][j];
      }
    }
    return retVal;
  }

  public static transpose(input: IMatrix): Matrix {
    // Note the transpose of a non-square matrix swaps the width and height
    const retVal: Matrix = new Matrix(input.columns, input.rows);
    for (let j = 0; j < input.columns; j++) {
      for (let i = 0; i < input.rows; i++) {
        retVal.components[j][i] = input.components[i][j];
      }
    }
    return retVal;
  }

  public static add(lhs: IMatrix, rhs: IMatrix): Matrix {
    if (lhs.rows !== rhs.rows || lhs.columns !== rhs.columns) {
      throw new Error(`Dimensions do not match between ${lhs.rows}x${lhs.columns} vs ${rhs.rows}x${rhs.columns}`);
    }
    const retVal: Matrix = new Matrix(lhs.columns, lhs.rows);
    for (let i: number = 0; i < retVal.rows; i++) {
      for (let j: number = 0; j < retVal.columns; j++) {
        retVal.components[i][j] = lhs.components[i][j] + rhs.components[i][j];
      }
    }
    return retVal;
  }

  public static subtract(lhs: IMatrix, rhs: IMatrix): Matrix {
    if (lhs.rows !== rhs.rows || lhs.columns !== rhs.columns) {
      throw new Error(`Dimensions do not match between ${lhs.rows}x${lhs.columns} vs ${rhs.rows}x${rhs.columns}`);
    }
    const retVal: Matrix = new Matrix(lhs.columns, lhs.rows);
    for (let i: number = 0; i < retVal.rows; i++) {
      for (let j: number = 0; j < retVal.columns; j++) {
        retVal.components[i][j] = lhs.components[i][j] - rhs.components[i][j];
      }
    }
    return retVal;
  }

  public static multiply(lhs: IMatrix, rhs: IMatrix): Matrix {
    if (lhs.columns !== rhs.rows) {
      throw new Error(`Dimensions do not match between ${lhs.rows}x${lhs.columns} vs ${rhs.rows}x${rhs.columns}`);
    }
    const retVal: Matrix = new Matrix(lhs.rows, rhs.columns);
    for (let i: number = 0; i < retVal.rows; i++) {
      for (let j: number = 0; j < retVal.columns; j++) {
        let sum: number = 0;
        for (let k: number = 0; k < lhs.columns; k++) {
          sum += lhs.components[i][k] * rhs.components[k][j];
        }
        retVal.components[i][j] = sum;
      }
    }
    return retVal;
  }

  public static columnVectorProduct(lhs: IMatrix, rhs: IVector): Vector {
    if (lhs.columns !== rhs.components.length) {
      throw new Error(`Dimensions do not match between ${lhs.rows}x${lhs.columns} vs ${rhs.components.length}`);
    }
    const retVal: Vector = new Vector(lhs.rows);
    for (let i: number = 0; i < lhs.rows; i++) {
      let sum: number = 0;
      for (let j: number = 0; j < lhs.columns; j++) {
        sum += lhs.components[i][j] * rhs.components[j];
      }
      retVal.components[i] = sum;
    }
    return retVal;
  }

  public static rowVectorProduct(lhs: IMatrix, rhs: IRowVector): RowVector {
    if (lhs.rows != rhs.components.length) {
      throw new Error(`Dimensions do not match between ${lhs.rows}x${lhs.columns} vs ${rhs.components.length}`);
    }
    const retVal: RowVector = new RowVector(lhs.columns);
    for (let j: number = 0; j < lhs.columns; j++) {
      let sum: number = 0;
      for (let i: number = 0; lhs.rows; i++) {
        sum += lhs.components[i][j] * rhs.components[i];
      }
      retVal.components[j] = sum;
    }
    return retVal;
  }

  public static convertColumnToVector(input: IMatrix, column: number): Vector {
    if (column < 0 || column >= input.columns) {
      throw new Error(`Invalid column ${column} for matrix with ${input.columns}`);
    }
    const retVal: Vector = new Vector(input.rows);
    for (let i: number = 0; i < input.rows; i++) {
      retVal.components[i] = input.components[i][column];
    }
    return retVal;
  }

  public static convertRowToVector(input: IMatrix, row: number): RowVector {
    if (row < 0 || row >= input.rows) {
      throw new Error(`Invalid row ${row} for matrix with ${input.rows}`);
    }
    return new RowVector(input.components[row]);
  }

  public static trace(input: IMatrix): number {
    if (input.columns !== input.rows) {
      throw new Error("Trace is only defined for a square matrix");
    }
    if (input.columns === 0 || input.rows === 0) {
      return 0;
    }
    let retVal: number = 0;
    for (let i: number = 0; i < input.columns; i++) {
      retVal += input.components[i][i];
    }
    return retVal;
  }

  public static linearCombination(scalars: number[], matrices: IMatrix[]): Matrix {
    if (scalars.length !== matrices.length) {
      throw new Error(`Length of scalars ${scalars.length} does not match length of matrices ${matrices.length}`);
    }
    if (matrices.length === 0) {
      return new Matrix(0, 0);
    }
    const rows: number = matrices[0].rows;
    const columns: number = matrices[0].columns;
    const retVal: Matrix = new Matrix(rows, columns, 0);
    for (let i: number = 0; i < matrices.length; i++) {
      if (matrices[i].rows !== rows || matrices[i].columns !== columns) {
        throw new Error("Matrices must all be the same shape");
      }
      retVal.addAssign(Matrix.scale(scalars[i], matrices[i]));
    }
    return retVal;
  }

  public static squareIdentityMatrix(width: number): Matrix {
    if (width < 1) {
      throw new Error(`Invalid width ${width}`);
    }
    const retVal: Matrix = new Matrix(width, width, 0);
    for (let i: number = 0; i < width; i++) {
      retVal.components[i][i] = 1;
    }
    return retVal;
  }

  public static integerPower(input: IMatrix, power: number): Matrix {
    if (power < 0) {
      throw new Error(`integerPower is not defined for power ${power}`);
    }
    if (input.rows !== input.columns) {
      throw new Error("integerPower is only defined for square matrices");
    }
    if (power === 0) {
      return this.squareIdentityMatrix(input.rows);
    }
    const retVal: Matrix = Matrix.clone(input);
    for (let i: number = 1; i < power; i++) {
      retVal.multiplyAssign(input);
    }
    return retVal;
  }
}
