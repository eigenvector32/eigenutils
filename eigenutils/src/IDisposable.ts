export interface IDisposable {
    [Symbol.dispose]: () => void;
}

export function isDisposable(input: any): input is IDisposable {
    if (input === null || input === undefined) {
        return false;
    }
    return input[Symbol.dispose] !== undefined;
}