// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IComplex, isIComplex, Complex } from "./IComplex";
import { ComplexMatrix } from "./IComplexMatrix";
import { ComplexRowVector, IComplexRowVector } from "./IComplexRowVector";

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

  public clone(): ComplexVector {
    return ComplexVector.clone(this);
  }

  public magnitude(): number {
    return ComplexVector.magnitude(this);
  }

  public scale(scalar: number | IComplex): ComplexVector {
    return ComplexVector.scale(scalar, this);
  }

  public normalize(): ComplexVector | null {
    return ComplexVector.normalize(this);
  }

  public conjugate(): ComplexVector {
    return ComplexVector.conjugate(this);
  }

  public transpose(): ComplexRowVector {
    return ComplexVector.transpose(this);
  }

  public hermitianTranspose(): ComplexRowVector {
    return ComplexVector.hermitianTranspose(this);
  }

  public dotProduct(rhs: IComplexVector): Complex {
    return ComplexVector.dotProduct(this, rhs);
  }

  public hermitianInnerProduct(rhs: IComplexVector): Complex {
    return ComplexVector.hermitianInnerProduct(this.transpose(), rhs);
  }

  public outerProduct(rhs: IComplexRowVector): ComplexMatrix {
    return ComplexVector.outerProduct(this, rhs);
  }

  public tensorProduct(rhs: IComplexVector): ComplexVector {
    return ComplexVector.tensorProduct(this, rhs);
  }

  public static clone(input: IComplexVector): ComplexVector {
    return new ComplexVector(input.components);
  }

  public static magnitude(input: IComplexVector): number {
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

  public static scale(scalar: number | IComplex, input: IComplexVector): ComplexVector {
    if (input.components.length === 0) {
      return new ComplexVector(0);
    }
    const retVal: ComplexVector = new ComplexVector(input.components.length);
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

  public static normalize(input: IComplexVector): ComplexVector | null {
    const magnitude: number = ComplexVector.magnitude(input);
    if (magnitude === 0) {
      return null;
    }
    if (magnitude === 1) {
      // Avoid floating point errors accumulating from the divide and multiply
      return ComplexVector.clone(input);
    }
    const scalar: number = 1 / magnitude;
    return ComplexVector.scale(scalar, input);
  }

  public static conjugate(input: IComplexVector): ComplexVector {
    if (input.components.length === 0) {
      return new ComplexVector(0);
    }
    const retVal = new ComplexVector(input.components.length);
    for (let i: number = 0; i < input.components.length; i++) {
      retVal.components[i] = Complex.conjugate(input.components[i]);
    }
    return retVal;
  }

  public static transpose(input: IComplexVector): ComplexRowVector {
    return new ComplexRowVector(input.components);
  }

  public static hermitianTranspose(input: IComplexVector): ComplexRowVector {
    const conjugate: ComplexVector = ComplexVector.conjugate(input);
    return conjugate.transpose();
  }

  public static dotProduct(lhs: IComplexRowVector, rhs: IComplexVector): Complex {
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
      const conjugate: Complex = Complex.conjugate(lhs.components[i]);
      retVal.addAssign(conjugate.multiply(rhs.components[i]));
    }
    return retVal;
  }

  public static outerProduct(lhs: IComplexVector, rhs: IComplexRowVector): ComplexMatrix {
    const retVal: ComplexMatrix = new ComplexMatrix(lhs.components.length, rhs.components.length);
    for (let i: number = 0; i < lhs.components.length; i++) {
      for (let j: number = 0; j < rhs.components.length; j++) {
        retVal.components[i][j] = Complex.multiply(lhs.components[i], Complex.conjugate(rhs.components[j]));
      }
    }
    return retVal;
  }

  public static tensorProduct(lhs: IComplexVector, rhs: IComplexVector): ComplexVector {
    if (lhs.components.length === 0 || rhs.components.length === 0) {
      return new ComplexVector(0);
    }
    const retVal: ComplexVector = new ComplexVector(lhs.components.length * rhs.components.length);
    for (let i: number = 0; i < lhs.components.length; i++) {
      for (let j: number = 0; j < rhs.components.length; j++) {
        const index: number = j + i * rhs.components.length;
        retVal.components[index] = Complex.multiply(lhs.components[i], rhs.components[j]);
      }
    }
    return retVal;
  }
}
