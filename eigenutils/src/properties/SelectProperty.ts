// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { FireMode } from "../emitter/FireMode";
import { INode } from "./INode";
import { Property } from "./Property";

export interface ISelectPropertyOption {
  caption: string;
  id: string;
}

// This subclass of property is intended for cases where one option (or null) is selected from a list of options
// each of which has an id and a user-facing caption. IE: for a Select dropdown or listbox.
// The value of the property is the id of the selected option
export class SelectProperty extends Property<string | null> {
  constructor(value: string | null, options: ISelectPropertyOption[], parent: WeakRef<INode> | null = null, dataChangedFireMode: FireMode = FireMode.Debounce) {
    super(value, parent, dataChangedFireMode);

    this._options = options;
  }

  public override toString(): string {
    if (this._isDisposed) {
      return "SelectProperty(disposed)";
    } else {
      return `SelectProperty(${this._value})`;
    }
  }

  protected _options: ISelectPropertyOption[];
  public get options(): ReadonlyArray<ISelectPropertyOption> {
    return this._options;
  }

  public get selectedCaption(): string | null {
    for (let i: number = 0; i < this._options.length; i++) {
      if (this._options[i].id === this._value) {
        return this._options[i].caption;
      }
    }
    return null;
  }
}
