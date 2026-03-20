import { IDependencyContainer } from "./IDependencyContainer";

export const IViewSymbol: unique symbol = Symbol.for("eigenutils.IView");

export interface IView {
    [IViewSymbol]: true;

    dependencyContainer: IDependencyContainer | null;
}

export function isIView(input: any): input is IView {
    if (input === null || input === undefined) {
        return false;
    }
    return input[IViewSymbol] === true;
}