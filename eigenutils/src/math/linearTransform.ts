// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IReadonlyMatrix3x3 } from "./IMatrix3x3";
import { IReadonlyVector3, IVector3 } from "./IVector3";

export function linearTransform(matrix: IReadonlyMatrix3x3, x: number, y: number, z: number): IVector3 {
  return {
    x: matrix.m11 * x + matrix.m12 * y + matrix.m13 * z,
    y: matrix.m21 * x + matrix.m22 * y + matrix.m23 * z,
    z: matrix.m31 * x + matrix.m32 * y + matrix.m33 * z
  };
}

export function linearTransformVector3(matrix: IReadonlyMatrix3x3, vector: IReadonlyVector3): IVector3 {
  return {
    x: matrix.m11 * vector.x + matrix.m12 * vector.y + matrix.m13 * vector.z,
    y: matrix.m21 * vector.x + matrix.m22 * vector.y + matrix.m23 * vector.z,
    z: matrix.m31 * vector.x + matrix.m32 * vector.y + matrix.m33 * vector.z
  };
}
