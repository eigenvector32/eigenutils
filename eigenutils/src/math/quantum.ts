// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { integerFactorial } from "./factorial";
import { IComplex, Complex } from "./IComplex";
import { IComplexMatrix, ComplexMatrix } from "./IComplexMatrix";
import { ComplexVector, IComplexVector } from "./IComplexVector";

// This uses the same rather frustrating convention in the existing literature where
// the indices for the Gell-Mann matrices and generators of SU(3) and other such indices
// are 1 based not 0 based. So for this function a must be 1-8.
export function getGellMann(a: number): ComplexMatrix {
  switch (a) {
    case 1:
      return new ComplexMatrix([
        [new Complex(0, 0), new Complex(1, 0), new Complex(0, 0)],
        [new Complex(1, 0), new Complex(0, 0), new Complex(0, 0)],
        [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)]
      ]);
    case 2:
      return new ComplexMatrix([
        [new Complex(0, 0), new Complex(0, -1), new Complex(0, 0)],
        [new Complex(0, 1), new Complex(0, 0), new Complex(0, 0)],
        [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)]
      ]);
    case 3:
      return new ComplexMatrix([
        [new Complex(1, 0), new Complex(0, 0), new Complex(0, 0)],
        [new Complex(0, 0), new Complex(-1, 0), new Complex(0, 0)],
        [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)]
      ]);
    case 4:
      return new ComplexMatrix([
        [new Complex(0, 0), new Complex(0, 0), new Complex(1, 0)],
        [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)],
        [new Complex(1, 0), new Complex(0, 0), new Complex(0, 0)]
      ]);
    case 5:
      return new ComplexMatrix([
        [new Complex(0, 0), new Complex(0, 0), new Complex(0, -1)],
        [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)],
        [new Complex(0, 1), new Complex(0, 0), new Complex(0, 0)]
      ]);
    case 6:
      return new ComplexMatrix([
        [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)],
        [new Complex(0, 0), new Complex(0, 0), new Complex(1, 0)],
        [new Complex(0, 0), new Complex(1, 0), new Complex(0, 0)]
      ]);
    case 7:
      return new ComplexMatrix([
        [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)],
        [new Complex(0, 0), new Complex(0, 0), new Complex(0, -1)],
        [new Complex(0, 0), new Complex(0, 1), new Complex(0, 0)]
      ]);
    case 8:
      return new ComplexMatrix([
        [new Complex(1 / Math.sqrt(3), 0), new Complex(0, 0), new Complex(0, 0)],
        [new Complex(0, 0), new Complex(1 / Math.sqrt(3), 0), new Complex(0, 0)],
        [new Complex(0, 0), new Complex(0, 0), new Complex(-2 / Math.sqrt(3), 0)]
      ]);
    default:
      throw new Error(`Unexpected index ${a}`);
  }
}

// The index a is 1 based so must be 1-8
export function getSU3Generator(a: number) {
  return getGellMann(a).scale(0.5);
}

export function getSU3Generators(): ComplexMatrix[] {
  const retVal: ComplexMatrix[] = new Array<ComplexMatrix>();
  for (let i: number = 0; i < 8; i++) {
    retVal[i] = getSU3Generator(i + 1);
  }
  return retVal;
}

// Return the structure constants for SU(3). Usually written f(abc)
// The indices are 1 based so must be 1-8
export function generateSU3StructureConstant(a: number, b: number, c: number): Complex {
  const ta: ComplexMatrix = getGellMann(a);
  const tb: ComplexMatrix = getGellMann(b);
  const tc: ComplexMatrix = getGellMann(c);

  const commutator: ComplexMatrix = ta.commutator(tb);
  const g: ComplexMatrix = commutator.multiply(tc);
  const trace: Complex = g.trace();
  const factor: Complex = Complex.reciprocal(new Complex(0, 4));
  const retVal: Complex = trace.multiply(factor);
  return retVal;
}

// Computes G|q> where G is the linear combination of the SU3 generators with g
export function amplitudeOfQuarkAbsorbingGluon(q: IComplexVector, g: number[]): ComplexVector {
  if (q.components.length !== 3) {
    throw new Error("Vector quark state must have length 3");
  }
  if (g.length !== 8) {
    throw new Error("Vector gluon state must have length 8");
  }

  const generators: ComplexMatrix[] = getSU3Generators();
  const gluonOperator: ComplexMatrix = ComplexMatrix.linearCombination(g, generators);

  const amplitude: ComplexVector = gluonOperator.columnVectorProduct(q);
  return amplitude;
}

// Computes exp(i*alpha*G) * |q> where G is the linear combination of the SU3 generators with g
// this must be done as a Taylor series so terms is how many terms of the Taylor series to compute
export function quarkAbsorbsGluon(q: IComplexVector, g: number[], alpha: number, terms: number = 10): ComplexVector {
  if (q.components.length !== 3) {
    throw new Error("Vector quark state must have length 3");
  }
  if (g.length !== 8) {
    throw new Error("Vector gluon state must have length 8");
  }
  if (terms < 1) {
    throw new Error(`Invalid value for terms ${terms}`);
  }

  const generators: ComplexMatrix[] = getSU3Generators();
  const gluonOperator: ComplexMatrix = ComplexMatrix.linearCombination(g, generators);

  const ialpha: Complex = new Complex(0, alpha);

  const operatorExponent: ComplexMatrix = matrixExponential(gluonOperator, ialpha, terms);
  return operatorExponent.columnVectorProduct(q);
}

// Computes via a Taylor series expansion exp(scalar*G) where scalar is any complex number and G is any square complex matrix
export function matrixExponential(G: IComplexMatrix, scalar: IComplex, terms: number = 10): ComplexMatrix {
  if (G.columns !== G.rows) {
    throw new Error("matrixExpontial is only defined for square matrices");
  }
  if (G.columns === 0) {
    return new ComplexMatrix(0, 0);
  }
  const retVal: ComplexMatrix = ComplexMatrix.squareIdentityMatrix(G.rows);
  for (let n: number = 1; n < terms; n++) {
    const scalarExponent: Complex = Complex.integerPower(scalar, n);
    const recipricolFactorial: number = 1 / integerFactorial(n);
    const termScalar: Complex = scalarExponent.divide(recipricolFactorial);
    const termG: ComplexMatrix = ComplexMatrix.integerPower(G, n);
    retVal.addAssign(termG.scale(termScalar));
  }
  return retVal;
}
