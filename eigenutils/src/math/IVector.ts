// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IRowVector, RowVector } from "./IRowVector";
import { Matrix } from "./IMatrix";

export interface IVector {
  components: number[];
}

export function isIVector(input: any): input is IVector {
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

export class Vector implements IVector {
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

  public clone(): Vector {
    return Vector.clone(this);
  }

  public magnitude(): number {
    return Vector.magnitude(this);
  }

  public scale(scalar: number): Vector {
    return Vector.scale(scalar, this);
  }

  public normalize(): Vector | null {
    return Vector.normalize(this);
  }

  public transpose(): RowVector {
    return Vector.transpose(this);
  }

  public dotProduct(rhs: IVector): number {
    return Vector.dotProduct(this, rhs);
  }

  public outerProduct(rhs: IRowVector): Matrix {
    return Vector.outerProduct(this, rhs);
  }

  public tensorProduct(rhs: IVector): Vector {
    return Vector.tensorProduct(this, rhs);
  }

  public static clone(input: IVector): Vector {
    return new Vector(input.components);
  }

  public static magnitude(input: IVector): number {
    if (input.components.length === 0) {
      return 0;
    }
    let retVal: number = 0;
    for (let i: number = 0; i < input.components.length; i++) {
      retVal += Math.pow(input.components[i], 2);
    }
    return Math.sqrt(retVal);
  }

  public static scale(scalar: number, input: IVector): Vector {
    if (input.components.length === 0) {
      return new Vector(0);
    }
    const retVal: Vector = new Vector(input.components.length);
    for (let i: number = 0; i < input.components.length; i++) {
      retVal.components[i] = scalar * input.components[i];
    }
    return retVal;
  }

  public static normalize(input: IVector): Vector | null {
    const magnitude: number = Vector.magnitude(input);
    if (magnitude === 0) {
      return null;
    }
    if (magnitude === 1) {
      // Avoid floating point errors accumulating from the divide and multiply
      return Vector.clone(input);
    }
    const scalar: number = 1 / magnitude;
    return Vector.scale(scalar, input);
  }

  public static transpose(input: IVector): RowVector {
    return new RowVector(input.components);
  }

  public static dotProduct(lhs: IRowVector, rhs: IVector): number {
    if (lhs.components.length !== rhs.components.length) {
      throw new Error("Vectors are not of equal size");
    }
    let retVal: number = 0;
    for (let i: number = 0; i < lhs.components.length; i++) {
      retVal += lhs.components[i] * rhs.components[i];
    }
    return retVal;
  }

  public static outerProduct(lhs: IVector, rhs: IRowVector): Matrix {
    const retVal: Matrix = new Matrix(lhs.components.length, rhs.components.length);
    for (let i: number = 0; i < lhs.components.length; i++) {
      for (let j: number = 0; j < rhs.components.length; j++) {
        retVal.components[i][j] = lhs.components[i] * rhs.components[j];
      }
    }
    return retVal;
  }

  public static tensorProduct(lhs: IVector, rhs: IVector): Vector {
    if (lhs.components.length === 0 || rhs.components.length === 0) {
      return new Vector(0);
    }
    const retVal: Vector = new Vector(lhs.components.length * rhs.components.length);
    for (let i: number = 0; i < lhs.components.length; i++) {
      for (let j: number = 0; j < rhs.components.length; j++) {
        const index: number = j + i * rhs.components.length;
        retVal.components[index] = lhs.components[i] * rhs.components[j];
      }
    }
    return retVal;
  }
}
