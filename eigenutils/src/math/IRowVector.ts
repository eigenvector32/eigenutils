// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { Matrix } from "./IMatrix";
import { Vector, IVector } from "./IVector";

// Most of the implementations for a row vector are the same as a column vector. However, having the compiler type check that
// a row vs column error has been made is worth the duplication. Also, there are occasionally subtle differences in usage.
export interface IRowVector {
  components: number[];
}

export function isIRowVector(input: any): input is IRowVector {
  if (input === null || input === undefined || !Array.isArray(input.components)) {
    return false;
  }
  for (let i: number = 0; i < input.components.length; i++) {
    if (typeof input.components[i] !== "number") {
      return false;
    }
  }
  return true;
}

export class RowVector implements IRowVector {
  constructor(length: number, value?: number);
  constructor(input: number[]);
  constructor(input: number | number[], value?: number) {
    if (typeof input === "number") {
      this.components = new Array<number>(input);
      const v: number = value ?? 0;
      for (let i: number = 0; i < input; i++) {
        this.components[i] = v;
      }
    } else if (Array.isArray(input)) {
      this.components = new Array<number>(input.length);
      for (let i: number = 0; i < input.length; i++) {
        this.components[i] = input[i];
      }
    } else {
      this.components = [];
    }
  }

  public components: number[];

  public clone(): RowVector {
    return RowVector.clone(this);
  }

  public magnitude(): number {
    return RowVector.magnitude(this);
  }

  public scale(scalar: number): RowVector {
    return RowVector.scale(scalar, this);
  }

  public normalize(): RowVector | null {
    return RowVector.normalize(this);
  }

  public transpose(): Vector {
    return RowVector.transpose(this);
  }

  public dotProduct(rhs: IVector): number {
    return RowVector.dotProduct(this, rhs);
  }

  public outerProduct(rhs: IRowVector): Matrix {
    return RowVector.outerProduct(this, rhs);
  }

  public static clone(input: IRowVector): RowVector {
    return new RowVector(input.components);
  }

  public static magnitude(input: IRowVector): number {
    return Vector.magnitude(RowVector.transpose(input));
  }

  public static scale(scalar: number, input: IRowVector): RowVector {
    return Vector.scale(scalar, RowVector.transpose(input)).transpose();
  }

  public static normalize(input: IRowVector): RowVector | null {
    return Vector.normalize(RowVector.transpose(input))?.transpose() ?? null;
  }

  public static transpose(input: IRowVector): Vector {
    return new Vector(input.components);
  }

  public static dotProduct(lhs: IRowVector, rhs: IVector): number {
    return Vector.dotProduct(lhs, rhs);
  }

  public static outerProduct(lhs: IVector, rhs: IRowVector): Matrix {
    return Vector.outerProduct(lhs, rhs);
  }

  // Note this is a rank 2 Tensor as compared to a rank 1 tensor resulting from two column vectors
  public static tensorProduct(lhs: IRowVector, rhs: IRowVector): Matrix {
    const retVal: Matrix = new Matrix(lhs.components.length, rhs.components.length);
    for (let i: number = 0; i < lhs.components.length; i++) {
      for (let j: number = 0; j < rhs.components.length; j++) {
        retVal.components[i][j] = lhs.components[i] * rhs.components[j];
      }
    }
    return retVal;
  }
}
