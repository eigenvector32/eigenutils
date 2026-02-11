import "./globalGC";

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