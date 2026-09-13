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

  public scale(scalar: number): ComplexRowVector {
    return ComplexRowVector.scale(scalar, this);
  }

  public normalize(): ComplexRowVector {
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
    if (input.components.length === 0) {
      return 0;
    }
    let retVal: number = 0;
    for (let i: number = 0; i < input.components.length; i++) {
      const c: IComplex = input.components[i];
      retVal += c.a * c.a + c.b * c.b;
    }
    return Math.sqrt(retVal);
  }

  public static scale(scalar: number | IComplex, input: IComplexRowVector): ComplexRowVector {
    if (input.components.length === 0) {
      return new ComplexRowVector(0);
    }
    const retVal: ComplexRowVector = new ComplexRowVector(input.components.length);
    for (let i: number = 0; i < input.components.length; i++) {
      const component: IComplex = retVal.components[i];
      if (typeof scalar === "number") {
        component.a *= scalar;
        component.b *= scalar;
      } else if (isIComplex(scalar)) {
        retVal.components[i] = Complex.multiply(scalar, component);
      }
    }
    return retVal;
  }

  public static normalize(input: IComplexRowVector): ComplexRowVector {
    const magnitude: number = ComplexRowVector.magnitude(input);
    if (magnitude === 0) {
      return new ComplexRowVector(input.components.length);
    }
    const scalar: number = 1 / magnitude;
    return ComplexRowVector.scale(scalar, input);
  }

  public static conjugate(lhs: IComplexRowVector): ComplexRowVector {
    if (lhs.components.length === 0) {
      return new ComplexRowVector(0);
    }
    const retVal = new ComplexRowVector(lhs.components.length);
    for (let i: number = 0; i < lhs.components.length; i++) {
      retVal.components[i] = Complex.conjugate(lhs.components[i]);
    }
    return retVal;
  }

  public static transpose(input: IComplexRowVector): ComplexVector {
    return new ComplexVector(input.components);
  }

  public static hermitianTranspose(input: IComplexRowVector): ComplexVector {
    const conjugate: ComplexRowVector = ComplexRowVector.conjugate(input);
    return conjugate.transpose();
  }

  public static dotProduct(lhs: IComplexVector | IComplexRowVector, rhs: IComplexVector): Complex {
    if (lhs.components.length !== rhs.components.length) {
      throw new Error("Vectors are not of equal size");
    }
    const retVal: Complex = new Complex(0, 0);
    for (let i: number = 0; i < lhs.components.length; i++) {
      retVal.addAssign(Complex.multiply(lhs.components[i], rhs.components[i]));
    }
    return retVal;
  }

  public static hermitianInnerProduct(lhs: IComplexRowVector, rhs: IComplexVector): Complex {
    if (lhs.components.length !== rhs.components.length) {
      throw new Error("Vectors are not of equal size");
    }
    const retVal: Complex = new Complex(0, 0);
    for (let i: number = 0; i < lhs.components.length; i++) {
      const lhsConjugate: Complex = Complex.conjugate(lhs.components[i]);
      retVal.addAssign(Complex.multiply(lhsConjugate, rhs.components[i]));
    }
    return retVal;
  }

  public static outerProduct(lhs: IComplexVector, rhs: IComplexRowVector): ComplexMatrix {
    const retVal: ComplexMatrix = new ComplexMatrix(lhs.components.length, rhs.components.length);
    for (let i: number = 0; i < lhs.components.length; i++) {
      for (let j: number = 0; j < rhs.components.length; j++) {
        retVal.components[i][j] = Complex.multiply(lhs.components[i], rhs.components[j]);
      }
    }

    return retVal;
  }
}
