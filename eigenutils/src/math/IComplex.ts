// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

export interface IComplex {
  a: number;
  b: number;
}

export function isIComplex(input: any): input is IComplex {
  if (input === null || input === undefined || Number.isNaN(input.x) || Number.isNaN(input.y)) {
    return false;
  }
  return true;
}

export class Complex implements IComplex {
  constructor(a: number = 0, b: number = 0) {
    this.a = a;
    this.b = b;
  }

  public a: number;
  public b: number;

  public clone(): Complex {
    return Complex.clone(this);
  }

  public assign(input: IComplex): void {
    this.a = input.a;
    this.b = input.b;
  }

  public addAssign(input: IComplex): void {
    this.a += input.a;
    this.b += input.b;
  }

  public subtractAssign(input: IComplex): void {
    this.a -= input.a;
    this.b -= input.b;
  }

  public multiplyAssign(input: IComplex): void {
    const product: Complex = this.multiply(input);
    this.a = product.a;
    this.b = product.b;
  }

  public divideAssign(input: IComplex): void {
    const quotient: Complex = this.divide(input);
    this.a = quotient.a;
    this.b = quotient.b;
  }

  public conjugateAssign(): void {
    const conjugate: Complex = this.conjugate();
    this.a = conjugate.a;
    this.b = conjugate.b;
  }

  public normalize(): IComplex {
    return Complex.normalize(this);
  }

  public add(rhs: number | IComplex): Complex {
    return Complex.add(this, rhs);
  }

  public subtract(rhs: number | IComplex): Complex {
    return Complex.subtract(this, rhs);
  }

  public multiply(rhs: number | IComplex): Complex {
    return Complex.multiply(this, rhs);
  }

  public reciprocal(): Complex {
    return Complex.reciprocal(this);
  }

  public divide(denominator: number | IComplex): Complex {
    return Complex.divide(this, denominator);
  }

  public magnitude(): number {
    return Complex.magnitude(this);
  }

  public conjugate(): Complex {
    return Complex.conjugate(this);
  }

  public static clone(input: IComplex): Complex {
    return new Complex(input.a, input.b);
  }

  public static normalize(input: IComplex): Complex {
    if (input.a === 0 && input.b === 0) {
      throw new Error("Divide by zero");
    }
    const magnitude: number = Complex.magnitude(input);
    return new Complex(input.a / magnitude, input.b / magnitude);
  }

  public static add(lhs: number | IComplex, rhs: number | IComplex) {
    if (typeof lhs === "number") {
      lhs = new Complex(lhs, 0);
    }
    if (typeof rhs === "number") {
      rhs = new Complex(rhs, 0);
    }
    return new Complex(lhs.a + rhs.a, lhs.b + rhs.b);
  }

  public static subtract(lhs: number | IComplex, rhs: number | IComplex): Complex {
    if (typeof lhs === "number") {
      lhs = new Complex(lhs, 0);
    }
    if (typeof rhs === "number") {
      rhs = new Complex(rhs, 0);
    }
    return new Complex(lhs.a - rhs.a, lhs.b - rhs.b);
  }

  public static multiply(lhs: number | IComplex, rhs: number | IComplex): Complex {
    if (typeof lhs === "number") {
      lhs = new Complex(lhs, 0);
    }
    if (typeof rhs === "number") {
      rhs = new Complex(rhs, 0);
    }
    return new Complex(lhs.a * rhs.a - lhs.b * rhs.b, lhs.a * rhs.b + lhs.b * rhs.a);
  }

  public static reciprocal(input: IComplex): Complex {
    if (input.a === 0 && input.b === 0) {
      throw new Error("Divide by zero");
    }
    const denominator: number = Math.pow(input.a, 2) + Math.pow(input.b, 2);
    return new Complex(input.a / denominator, -input.b / denominator);
  }

  public static divide(numerator: number | IComplex, denominator: number | IComplex): Complex {
    if (typeof numerator === "number") {
      numerator = new Complex(numerator, 0);
    }
    if (typeof denominator === "number") {
      denominator = new Complex(denominator, 0);
    }
    if (denominator.a === 0 && denominator.b === 0) {
      throw new Error("Divide by zero");
    }
    const d: number = Math.pow(denominator.a, 2) + Math.pow(denominator.b, 2);
    return new Complex((numerator.a * denominator.a + numerator.b + denominator.b) / d, (numerator.b * denominator.a - numerator.a * denominator.b) / d);
  }

  public static magnitude(input: IComplex): number {
    return Math.hypot(input.a, input.b);
  }

  public static conjugate(input: IComplex): Complex {
    return new Complex(input.a, -1 * input.b);
  }
}
