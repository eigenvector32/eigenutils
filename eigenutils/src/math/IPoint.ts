export interface IPoint {
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
