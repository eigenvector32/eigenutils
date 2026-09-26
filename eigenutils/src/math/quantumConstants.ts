import { Complex } from "./IComplex";
import { ComplexMatrix } from "./IComplexMatrix";

// The 8 Gell-Mann matrices which are used to create the generators of SU(3)
export const gellMann: ComplexMatrix[] = [
  new ComplexMatrix([
    [new Complex(0, 0), new Complex(1, 0), new Complex(0, 0)],
    [new Complex(1, 0), new Complex(0, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)]
  ]),
  new ComplexMatrix([
    [new Complex(0, 0), new Complex(0, -1), new Complex(0, 0)],
    [new Complex(0, 1), new Complex(0, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)]
  ]),
  new ComplexMatrix([
    [new Complex(1, 0), new Complex(0, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(-1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)]
  ]),
  new ComplexMatrix([
    [new Complex(0, 0), new Complex(0, 0), new Complex(1, 0)],
    [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)],
    [new Complex(1, 0), new Complex(0, 0), new Complex(0, 0)]
  ]),
  new ComplexMatrix([
    [new Complex(0, 0), new Complex(0, 0), new Complex(0, -1)],
    [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)],
    [new Complex(0, 1), new Complex(0, 0), new Complex(0, 0)]
  ]),
  new ComplexMatrix([
    [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(0, 0), new Complex(1, 0)],
    [new Complex(0, 0), new Complex(1, 0), new Complex(0, 0)]
  ]),
  new ComplexMatrix([
    [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(0, 0), new Complex(0, -1)],
    [new Complex(0, 0), new Complex(0, 1), new Complex(0, 0)]
  ]),
  new ComplexMatrix([
    [new Complex(1 / Math.sqrt(3), 0), new Complex(0, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(1 / Math.sqrt(3), 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(0, 0), new Complex(-2 / Math.sqrt(3), 0)]
  ])
];

// The SU(3) generators are just the Gell-Mann matrices /2
export const su3Generators: ComplexMatrix[] = [
  gellMann[0].scale(0.5),
  gellMann[1].scale(0.5),
  gellMann[2].scale(0.5),
  gellMann[3].scale(0.5),
  gellMann[4].scale(0.5),
  gellMann[5].scale(0.5),
  gellMann[6].scale(0.5),
  gellMann[7].scale(0.5)
];
