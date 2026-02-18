// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import "../../tests/globalGC";
import { waitForFinalize } from "../../tests/waitForFinalize"
import { DualVoidEmitter } from "../DualVoidEmitter";
import { FireMode } from "../FireMode";
import { IDisposable } from "../../IDisposable";

describe('Tests for DualVoidEmitter', () => {
    test('Objects held only by the emitter are finalized', async () => {
        expect(gc).toBeDefined();

        let testHandler: (() => void) | null = () => { };

        const emitter: DualVoidEmitter = new DualVoidEmitter();
        emitter.event(testHandler, null, true);

        const weakTestHandler: WeakRef<any> = new WeakRef(testHandler);
        testHandler = null;

        expect(weakTestHandler.deref()).toBeDefined();

        await waitForFinalize(weakTestHandler);

        expect(weakTestHandler.deref()).toBeUndefined();
    });

    test('Listener which is finalized is not called', async () => {
        expect(gc).toBeDefined();
        let count: number = 0;

        let testHandler: (() => void) | null = () => {
            count++;
        };

        const emitter: DualVoidEmitter = new DualVoidEmitter();
        emitter.event(testHandler, null, true);

        const weakTestHandler: WeakRef<any> = new WeakRef(testHandler);
        testHandler = null;

        expect(weakTestHandler.deref()).toBeDefined();

        await waitForFinalize(weakTestHandler);

        expect(weakTestHandler.deref()).toBeUndefined();

        expect(count).toBe(0);

        emitter.fire();

        expect(count).toBe(0);
    });

    test('Listener which is finalized is removed during fire', async () => {
        expect(gc).toBeDefined();

        let testHandler: (() => void) | null = () => {
        };

        const emitter: DualVoidEmitter = new DualVoidEmitter();
        emitter.event(testHandler, null, true);

        const weakTestHandler: WeakRef<any> = new WeakRef(testHandler);
        testHandler = null;

        expect(weakTestHandler.deref()).toBeDefined();

        await waitForFinalize(weakTestHandler);

        expect(weakTestHandler.deref()).toBeUndefined();
        expect(emitter.listenerCount).toBe(1);

        emitter.fire();

        expect(emitter.listenerCount).toBe(0);
    });

    test('Adding the same listener twice is called once during fire', () => {
        let count: number = 0;

        const listener: () => void = () => {
            count++;
        };

        const emitter: DualVoidEmitter = new DualVoidEmitter();
        emitter.event(listener);
        emitter.event(listener);

        expect(count).toBe(0);

        emitter.fire();

        expect(count).toBe(1);
        expect(emitter.listenerCount).toBe(1);
    });

    test('Adding the same listener twice and disposing both does not throw', () => {
        let count: number = 0;

        const listener: () => void = () => {
            count++;
        };

        const emitter: DualVoidEmitter = new DualVoidEmitter();
        const tokenA: IDisposable = emitter.event(listener);
        const tokenB: IDisposable = emitter.event(listener);

        expect(count).toBe(0);

        emitter.fire();

        expect(count).toBe(1);
        expect(emitter.listenerCount).toBe(1);

        tokenA[Symbol.dispose]();
        tokenB[Symbol.dispose]();

        expect(emitter.listenerCount).toBe(0);
    });

    test('Disposing a listener removes the event handler', () => {
        let count: number = 0;

        const emitter: DualVoidEmitter = new DualVoidEmitter(FireMode.Synchronous);
        const listener: IDisposable = emitter.event(() => {
            count++;
        });

        expect(count).toBe(0);
        emitter.fire();
        expect(count).toBe(1);
        listener[Symbol.dispose]();
        emitter.fire();
        expect(count).toBe(1);
    });

    test('Disposing a listener after the emitter does nothing', () => {
        const emitter: DualVoidEmitter = new DualVoidEmitter();
        const listener: IDisposable = emitter.event(() => { });
        emitter[Symbol.dispose]();
        listener[Symbol.dispose]();
    });

    test('Fire after dispose causes an exception', () => {
        const emitter: DualVoidEmitter = new DualVoidEmitter();
        emitter[Symbol.dispose]();
        expect(() => {
            emitter.fire();
        }).toThrow();
    });

    test('Getting event after dispose causes an exception', () => {
        const emitter: DualVoidEmitter = new DualVoidEmitter();
        emitter[Symbol.dispose]();
        expect(() => {
            emitter.event(() => { });
        }).toThrow();
    });

    test('Clear after dispose causes an exception', () => {
        const emitter: DualVoidEmitter = new DualVoidEmitter();
        emitter[Symbol.dispose]();
        expect(() => {
            emitter.clear();
        }).toThrow();
    });

    test('Fire Synchronous', () => {
        let count: number = 0;

        const emitter: DualVoidEmitter = new DualVoidEmitter(FireMode.Synchronous);
        emitter.event(() => {
            count++;
        });

        expect(count).toBe(0);
        emitter.fire();
        expect(count).toBe(1);
    });

    test('Removing listener in the event handler for a prior listener still fires event', () => {
        let countA: number = 0;
        let countB: number = 0;
        let first: boolean = true;

        const emitter: DualVoidEmitter = new DualVoidEmitter(FireMode.Synchronous);

        // The order in which listeners are called is undefined by the public interface of Emitter
        // so do not rely on ordering in this test
        const listenerA: IDisposable = emitter.event(() => {
            countA++;
            if (first) {
                first = false;
                listenerB[Symbol.dispose]();
            }
        });
        const listenerB: IDisposable = emitter.event(() => {
            countB++;
            if (first) {
                first = false;
                listenerA[Symbol.dispose]();
            }
        });

        expect(countA).toBe(0);
        expect(countB).toBe(0);

        emitter.fire();

        // The event should be received by both
        expect(countA).toBe(1);
        expect(countB).toBe(1);

        // Now the event should only be received by one
        emitter.fire();
        expect(countA !== countB);
    });

    test('Fire Microtask', async () => {
        let count: number = 0;

        const emitter: DualVoidEmitter = new DualVoidEmitter(FireMode.Microtask);
        emitter.event(() => {
            count++;
        });

        expect(count).toBe(0);
        emitter.fire();
        expect(count).toBe(0);

        await null;
        expect(count).toBe(1);
    });


    test('Disposing emitter before microtask does not fire event', async () => {
        let count: number = 0;

        const emitter: DualVoidEmitter = new DualVoidEmitter(FireMode.Microtask);
        emitter.event(() => {
            count++;
        });

        expect(count).toBe(0);
        emitter.fire();
        expect(count).toBe(0);

        emitter[Symbol.dispose]();
        await null;
        expect(count).toBe(0);
    });

    test('Removing listener before microtask does not fire event', async () => {
        let count: number = 0;

        const emitter: DualVoidEmitter = new DualVoidEmitter(FireMode.Microtask);
        const listener: IDisposable = emitter.event(() => {
            count++;
        });

        expect(count).toBe(0);
        emitter.fire();
        expect(count).toBe(0);

        listener[Symbol.dispose]();
        await null;
        expect(count).toBe(0);
    });

    test('Fire Debounce', async () => {
        let count: number = 0;

        const emitter: DualVoidEmitter = new DualVoidEmitter(FireMode.Debounce);
        emitter.event(() => {
            count++;
        });

        expect(count).toBe(0);
        emitter.fire();
        emitter.fire();
        emitter.fire();
        emitter.fire();
        expect(count).toBe(0);

        await null;
        expect(count).toBe(1);
    });

    test('Disposing emitter before debounce does not fire event', async () => {
        let count: number = 0;

        const emitter: DualVoidEmitter = new DualVoidEmitter(FireMode.Debounce);
        emitter.event(() => {
            count++;
        });

        expect(count).toBe(0);
        emitter.fire();
        expect(count).toBe(0);

        emitter[Symbol.dispose]();
        await null;
        expect(count).toBe(0);
    });

    test('Removing listener before debounce does not fire event', async () => {
        let count: number = 0;

        const emitter: DualVoidEmitter = new DualVoidEmitter(FireMode.Debounce);
        const listener: IDisposable = emitter.event(() => {
            count++;
        });

        expect(count).toBe(0);
        emitter.fire();
        expect(count).toBe(0);

        listener[Symbol.dispose]();
        await null;
        expect(count).toBe(0);
    });

    test('Fire Microtask | Debounce', async () => {
        let count: number = 0;

        const emitter: DualVoidEmitter = new DualVoidEmitter(FireMode.Microtask | FireMode.Debounce);
        emitter.event(() => {
            count++;
        });

        expect(count).toBe(0);
        emitter.fire();
        emitter.fire();
        emitter.fire();
        emitter.fire();
        expect(count).toBe(0);

        await null;
        // note the 5, 4 times for Microtask and once more for Debounce
        expect(count).toBe(5);
    });
});