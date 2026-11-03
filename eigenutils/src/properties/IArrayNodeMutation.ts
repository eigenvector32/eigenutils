export enum ArrayNodeMutationType {
  Add, // Add exactly 1 item to any index in the array, all indices after the added item will have changed
  Remove, // Remove exactly 1 item from any index in the array, all indices after the removed item will have changed
  Reorder, // No items added or removed but any and all indices could have changed
  // Special cases handled separately to allow for optimization
  Push, // Add exactly 1 item to the end of the array
  Pop, // Remove exactly 1 item from the end of the array
  Clear // Remove all
}

export const IArrayNodeMutationSymbol: unique symbol = Symbol.for("eigenutils.IArrayNodeMutation");

export function isIArrayNodeMutation(input: any): input is IArrayNodeMutation {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IArrayNodeMutationSymbol] === true;
}

export interface IArrayNodeMutation {
  [IArrayNodeMutationSymbol]: true;
  readonly type: ArrayNodeMutationType;
}

export const IArrayNodeAddMutationSymbol: unique symbol = Symbol.for("eigenutils.IArrayNodeAddMutation");

export function isIArrayNodeAddMutation(input: any): input is IArrayNodeAddMutation {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IArrayNodeAddMutationSymbol] === true;
}

export interface IArrayNodeAddMutation extends IArrayNodeMutation {
  [IArrayNodeAddMutationSymbol]: true;
  readonly index: number;
}

export const IArrayNodeRemoveMutationSymbol: unique symbol = Symbol.for("eigenutils.IArrayNodeRemoveMutation");

export function isIArrayNodeRemoveMutation(input: any): input is IArrayNodeRemoveMutation {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IArrayNodeRemoveMutationSymbol] === true;
}

export interface IArrayNodeRemoveMutation extends IArrayNodeMutation {
  [IArrayNodeRemoveMutationSymbol]: true;
  readonly index: number;
}
