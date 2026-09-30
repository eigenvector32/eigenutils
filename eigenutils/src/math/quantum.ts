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
export function getSU3Generator(a: number): ComplexMatrix {
  return getGellMann(a).scale(0.5);
}

// Returns a 0 based array of the SU3 generators for the fundamental representation. So generator 2 == index 1
export function getSU3Generators(): ComplexMatrix[] {
  const retVal: ComplexMatrix[] = new Array<ComplexMatrix>();
  for (let i: number = 0; i < 8; i++) {
    retVal[i] = getSU3Generator(i + 1);
  }
  return retVal;
}

// The index a is 1 based so must be 1-8
// Depending on which reference one is looking at, these values could have an extra sign of -1
// eg: the components can be either -i * f(abc) or i * f(abc). Set the sign argument to either
// 1 or -1 depending on which convention is used.
export function getSU3AdjointGenerator(a: number, sign: number = -1): ComplexMatrix {
  if (a < 1 || a > 8) {
    throw new Error(`Invalid index a ${a}`);
  }
  const scalar: Complex = new Complex(0, sign);
  const retVal: ComplexMatrix = new ComplexMatrix(8, 8, new Complex(0, 0));
  for (let b: number = 0; b < 8; b++) {
    for (let c: number = 0; c < 8; c++) {
      retVal.components[b][c] = scalar.multiply(getSU3StructureConstant(a, b + 1, c + 1));
    }
  }
  return retVal;
}

// Returns a 0 based array of the SU3 generators for the adjoing representation. So generator 2 == index 1
export function getSU3AdjointGenerators(sign: number = -1): ComplexMatrix[] {
  const retVal: ComplexMatrix[] = new Array<ComplexMatrix>();
  for (let i: number = 0; i < 8; i++) {
    retVal[i] = getSU3AdjointGenerator(i + 1, sign);
  }
  return retVal;
}

// Return the structure constants for SU(3). Usually written f(abc)
// The indices are 1 based so must be 1-8
export function getSU3StructureConstant(a: number, b: number, c: number): number {
  const ta: ComplexMatrix = getSU3Generator(a);
  const tb: ComplexMatrix = getSU3Generator(b);
  const tc: ComplexMatrix = getSU3Generator(c);

  const commutator: ComplexMatrix = ta.commutator(tb);
  const g: ComplexMatrix = commutator.multiply(tc);
  const trace: Complex = g.trace();
  const factor: Complex = new Complex(0, -2);
  const retVal: Complex = trace.multiply(factor);
  // At this point retVal should be fully real with no complex component left
  return retVal.a;
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

export function gluonAbsorbsGluon(ga: number[], gb: number[]): number[] {
  if (ga.length !== 8) {
    throw new Error(`Invalid length for ga ${ga.length}`);
  }
  if (gb.length !== 8) {
    throw new Error(`Invalid length for ga ${gb.length}`);
  }
  const retVal: number[] = new Array<number>(8);
  for (let i: number = 0; i < 8; i++) {
    retVal[i] = 0;
  }
  for (let c: number = 0; c < 8; c++) {
    for (let b: number = 0; b < 8; b++) {
      for (let a: number = 0; a < 8; a++) {
        retVal[c] += getSU3StructureConstant(a + 1, b + 1, c + 1) * ga[a] * gb[b];
      }
    }
  }
  return retVal;
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

export function normalizeDensityMatrix(input: IComplexMatrix): ComplexMatrix | null {
  const trace: Complex = ComplexMatrix.trace(input);
  if (trace.a === 0 && trace.b === 0) {
    return null;
  }
  return ComplexMatrix.scale(trace, input);
}
