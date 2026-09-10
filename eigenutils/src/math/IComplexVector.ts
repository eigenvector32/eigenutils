// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IComplex, isIComplex, Complex } from "./IComplex";
import { ComplexMatrix } from "./IComplexMatrix";

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

export class ComplexVector implements IComplexVector {
  constructor(input: number);
  constructor(input: IComplex[]);
  constructor(input: number | IComplex[]) {
    if (typeof input === "number") {
      this.components = new Array<Complex>(input);
      for (let i: number = 0; i < input; i++) {
        this.components[i] = new Complex(0, 0);
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

  public clone(): ComplexVector {
    return ComplexVector.clone(this);
  }

  public dotProduct(rhs: IComplexVector): Complex {
    return ComplexVector.dotProduct(this, rhs);
  }

  public hermitianInnerProduct(rhs: IComplexVector): Complex {
    return ComplexVector.hermitianInnerProduct(this, rhs);
  }

  public outerProduct(rhs: IComplexVector): ComplexMatrix {
    return ComplexVector.outerProduct(this, rhs);
  }

  public static clone(input: IComplexVector): ComplexVector {
    return new ComplexVector(input.components);
  }

  public static dotProduct(lhs: IComplexVector, rhs: IComplexVector): Complex {
    if (lhs.components.length !== rhs.components.length) {
      throw new Error("Vectors are not of equal size");
    }
    const retVal: Complex = new Complex(0, 0);
    for (let i: number = 0; i < lhs.components.length; i++) {
      retVal.addAssign(Complex.multiply(lhs.components[i], rhs.components[i]));
    }
    return retVal;
  }

  public static hermitianInnerProduct(lhs: IComplexVector, rhs: IComplexVector): Complex {
    if (lhs.components.length !== rhs.components.length) {
      throw new Error("Vectors are not of equal size");
    }
    const retVal: Complex = new Complex(0, 0);
    for (let i: number = 0; i < lhs.components.length; i++) {
      const rhsConjugate: Complex = Complex.conjugate(rhs.components[i]);
      retVal.addAssign(Complex.multiply(lhs.components[i], rhsConjugate));
    }
    return retVal;
  }

  public static outerProduct(lhs: IComplexVector, rhs: IComplexVector): ComplexMatrix {
    const retVal: ComplexMatrix = new ComplexMatrix(lhs.components.length, rhs.components.length);

    for (let i: number = 0; i < lhs.components.length; i++) {
      for (let j: number = 0; j < rhs.components.length; j++) {
        retVal.components[i][j] = Complex.multiply(lhs.components[i], rhs.components[j]);
      }
    }

    return retVal;
  }
}
