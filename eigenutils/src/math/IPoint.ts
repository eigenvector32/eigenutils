export interface IReadonlyPoint {
  readonly x: number;
  readonly y: number;
}

export function isIReadonlyPoint(input: any): input is IReadonlyPoint {
  if (
    input === null ||
    input === undefined ||
    Number.isNaN(input.x) ||
    Number.isNaN(input.y)
  ) {
    return false;
  }
  return true;
}

export interface IPoint extends IReadonlyPoint {
  x: number;
  y: number;
}

export function isIPoint(input: any): input is IPoint {
  if (
    input === null ||
    input === undefined ||
    Number.isNaN(input.x) ||
    Number.isNaN(input.y)
  ) {
    return false;
  }
  return true;
}
