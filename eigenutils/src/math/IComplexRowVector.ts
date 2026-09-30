// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IComplex, isIComplex, Complex } from "./IComplex";
import { ComplexMatrix } from "./IComplexMatrix";
import { ComplexVector, IComplexVector } from "./IComplexVector";

// Most of the implementations for a row vector are the same as a column vector. However, having the compiler type check that
// a row vs column error has been made is worth the duplication. Also, there are occasionally subtle differences in usage.
export interface IComplexRowVector {
  components: IComplex[];
}

export function isIComplexRowVector(input: any): input is IComplexRowVector {
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

export class ComplexRowVector implements IComplexRowVector {
  constructor(length: number, value?: IComplex);
  constructor(input: IComplex[]);
  constructor(input: number | IComplex[], value?: IComplex) {
    if (typeof input === "number") {
      this.components = new Array<Complex>(input);
      const v: IComplex = value ?? new Complex(0, 0);
      for (let i: number = 0; i < input; i++) {
        this.components[i] = Complex.clone(v);
      }
    } else if (Array.isArray(input)) {
      this.components = new Array<Complex>(input.length);
      for (let i: number = 0; i < input.length; i++) {
        this.components[i] = Complex.clone(input[i]);
      }
    } else {
      this.components = [];
    }
  }

  public components: IComplex[];

  public clone(): ComplexRowVector {
    return ComplexRowVector.clone(this);
  }

  public magnitude(): number {
    return ComplexRowVector.magnitude(this);
  }

  public scale(scalar: number | IComplex): ComplexRowVector {
    return ComplexRowVector.scale(scalar, this);
  }

  public normalize(): ComplexRowVector | null {
    return ComplexRowVector.normalize(this);
  }

  public conjugate(): ComplexRowVector {
    return ComplexRowVector.conjugate(this);
  }

  public transpose(): ComplexVector {
    return ComplexRowVector.transpose(this);
  }

  public hermitianTranspose(): ComplexVector {
    return ComplexRowVector.hermitianTranspose(this);
  }

  public dotProduct(rhs: IComplexVector): Complex {
    return ComplexRowVector.dotProduct(this, rhs);
  }

  public hermitianInnerProduct(rhs: IComplexVector): Complex {
    return ComplexRowVector.hermitianInnerProduct(this, rhs);
  }

  public outerProduct(rhs: IComplexRowVector): ComplexMatrix {
    return ComplexRowVector.outerProduct(this, rhs);
  }

  public static clone(input: IComplexRowVector): ComplexRowVector {
    return new ComplexRowVector(input.components);
  }

  public static magnitude(input: IComplexRowVector): number {
    return ComplexVector.magnitude(ComplexRowVector.transpose(input));
  }

  public static scale(scalar: number | IComplex, input: IComplexRowVector): ComplexRowVector {
    return ComplexVector.scale(scalar, ComplexRowVector.transpose(input)).transpose();
  }

  public static normalize(input: IComplexRowVector): ComplexRowVector | null {
    return ComplexVector.normalize(ComplexRowVector.transpose(input))?.transpose() ?? null;
  }

  public static conjugate(input: IComplexRowVector): ComplexRowVector {
    return ComplexVector.conjugate(ComplexRowVector.transpose(input)).transpose();
  }

  public static transpose(input: IComplexRowVector): ComplexVector {
    return new ComplexVector(input.components);
  }

  public static hermitianTranspose(input: IComplexRowVector): ComplexVector {
    return ComplexRowVector.transpose(input).conjugate();
  }

  public static dotProduct(lhs: IComplexRowVector, rhs: IComplexVector): Complex {
    return ComplexVector.dotProduct(lhs, rhs);
  }

  public static hermitianInnerProduct(lhs: IComplexRowVector, rhs: IComplexVector): Complex {
    return ComplexVector.hermitianInnerProduct(lhs, rhs);
  }

  public static outerProduct(lhs: IComplexVector, rhs: IComplexRowVector): ComplexMatrix {
    return ComplexVector.outerProduct(lhs, rhs);
  }

  // Note this is a rank 2 Tensor as compared to a rank 1 tensor resulting from two column vectors
  public static tensorProduct(lhs: IComplexRowVector, rhs: IComplexRowVector): ComplexMatrix {
    const retVal: ComplexMatrix = new ComplexMatrix(lhs.components.length, rhs.components.length);
    for (let i: number = 0; i < lhs.components.length; i++) {
      for (let j: number = 0; j < rhs.components.length; j++) {
        retVal.components[i][j] = Complex.multiply(lhs.components[i], rhs.components[j]);
      }
    }
    return retVal;
  }
}
