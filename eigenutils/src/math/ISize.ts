export interface IReadonlySize {
  readonly width: number;
  readonly height: number;
}

export function isIReadonlySize(input: any): input is IReadonlySize {
  if (
    input === null ||
    input === undefined ||
    Number.isNaN(input.width) ||
    Number.isNaN(input.height)
  ) {
    return false;
  }
  return true;
}

export function isValidIReadonlySize(input: any): input is IReadonlySize {
  if (
    input === null ||
    input === undefined ||
    Number.isNaN(input.width) ||
    Number.isNaN(input.height) ||
    input.width < 0 ||
    input.height < 0
  ) {
    return false;
  }
  return true;
}

export interface ISize extends IReadonlySize {
  width: number;
  height: number;
}

export function isISize(input: any): input is ISize {
  if (
    input === null ||
    input === undefined ||
    Number.isNaN(input.width) ||
    Number.isNaN(input.height)
  ) {
    return false;
  }
  return true;
}

export function isValidISize(input: any): input is ISize {
  if (
    input === null ||
    input === undefined ||
    Number.isNaN(input.width) ||
    Number.isNaN(input.height) ||
    input.width < 0 ||
    input.height < 0
  ) {
    return false;
  }
  return true;
}
