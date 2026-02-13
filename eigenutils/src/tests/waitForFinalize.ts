// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import "./globalGC";

// At first glance, using a global dictionary to store state for waitForFinalize seems inelegant. 
// It seems like it should be possible to handle this via lambda captures of the Promise returned
// from waitForFinalize. It actually turns out to be very tricky to do that without also capturing 
// via a strong reference something which will prevent the FinalizationRegistry callback from ever 
// firing. This implementation turns out to be much simpler. 
// Note that it is obvious why IWaitForFinalizeState include the FinalizationRegistry (otherwise 
// that would go out of scope before the callback is fired) but there is also something very strange
// going on here. It seems like resolver should be kept alive by being captured in 
// waiter:Promise<void>. But I found that if both registry and resolver are not independantly
// referenced as in this code then the FinalizationRegistry callback is never called.

interface IWaitForFinalizeState {
    targetRegistryId: symbol,
    targetUnregisterToken: WeakKey,
    registry: FinalizationRegistry<Symbol> | null,
    resolver: (() => void) | null
}

let globalWaitForFinalizeState: Map<symbol, IWaitForFinalizeState> | null = null;

export function waitForFinalize<T extends WeakKey>(target: WeakRef<T>, gcInterval: number = 100): Promise<void> {
    // While the below code works fine without calling gc first, this will catch some cases where a synch
    // gc will clean out target before needing to wait for the timeout.
    gc();

    let strongRef: T | undefined = target.deref();
    if (strongRef === undefined || strongRef === null) {
        return Promise.resolve();
    }

    const intervalId: number = setInterval(gc, gcInterval);

    const targetRegistryId: symbol = Symbol();
    const targetUnregisterToken: WeakKey = {};

    let resolver: (() => void) | null = null;
    const waiter: Promise<void> = new Promise<void>((resolve: () => void) => {
        resolver = resolve;
    });
    if (resolver === null) {
        throw new Error("Resolver was not set in waiter Promise");
    }

    const registry: FinalizationRegistry<Symbol> = new FinalizationRegistry((finalizationId: Symbol) => {
        if (finalizationId === targetRegistryId) {
            clearInterval(intervalId);
            if (globalWaitForFinalizeState !== null && globalWaitForFinalizeState.has(targetRegistryId)) {
                globalWaitForFinalizeState.delete(targetRegistryId);
            }
            if (resolver !== null) {
                resolver();
            }
        }
    });

    if (globalWaitForFinalizeState === null) {
        globalWaitForFinalizeState = new Map<symbol, IWaitForFinalizeState>();
    }
    globalWaitForFinalizeState.set(targetRegistryId, {
        targetRegistryId,
        targetUnregisterToken,
        registry,
        resolver
    });

    registry.register(strongRef, targetRegistryId, targetUnregisterToken);

    strongRef = undefined;

    return waiter;
}