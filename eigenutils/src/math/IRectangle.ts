import { IPoint } from "./IPoint";
import { ISize } from "./ISize";

export interface IRectangle extends IPoint, ISize {}

export function isIRectangle(input: any): input is IRectangle {
  if (
    input === null ||
    input === undefined ||
    Number.isNaN(input.x) ||
    Number.isNaN(input.y) ||
    Number.isNaN(input.width) ||
    Number.isNaN(input.height)
  ) {
    return false;
  }
  return true;
}

export function isValidIRectangle(input: any): input is IRectangle {
  if (
    input === null ||
    input === undefined ||
    Number.isNaN(input.x) ||
    Number.isNaN(input.y) ||
    Number.isNaN(input.width) ||
    Number.isNaN(input.height) ||
    input.width < 0 ||
    input.height < 0
  ) {
    return false;
  }
  return true;
}

export function outerBounds(input: IRectangle[]): IRectangle {
  if (input.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  let minX: number = Number.MAX_SAFE_INTEGER;
  let minY: number = Number.MAX_SAFE_INTEGER;
  let maxX: number = Number.MIN_SAFE_INTEGER;
  let maxY: number = Number.MIN_SAFE_INTEGER;
  for (let i: number = 0; i < input.length; i++) {
    minX = Math.min(minX, input[i].x);
    minY = Math.min(minY, input[i].y);
    maxX = Math.max(maxX, input[i].x + input[i].width);
    maxY = Math.max(maxY, input[i].y + input[i].height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
