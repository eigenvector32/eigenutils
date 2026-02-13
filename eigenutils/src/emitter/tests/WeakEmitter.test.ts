// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import "../../tests/globalGC";
import { waitForFinalize } from "../../tests/waitForFinalize"
import { WeakEmitter } from "../WeakEmitter";
import { FireMode } from "../FireMode";
import { IDisposable } from "../../IDisposable";

describe('Tests for WeakEmitter', () => {
    test('Objects held only by the emitter are finalized', async () => {
        expect(gc).toBeDefined();

        let testHandler: (() => void) | null = () => { };

        const emitter: WeakEmitter<number> = new WeakEmitter<number>();
        emitter.event(testHandler);

        const weakTestHandler: WeakRef<any> = new WeakRef(testHandler);
        testHandler = null;

        expect(weakTestHandler.deref()).toBeDefined();

        await waitForFinalize(weakTestHandler);

        expect(weakTestHandler.deref()).toBeUndefined();
    });

    test('Listener which is finalized is not called', async () => {
        expect(gc).toBeDefined();
        let testNumber: number = 0;

        let testHandler: ((newNumber: number) => void) | null = (newNumber: number) => {
            testNumber = newNumber;
        };

        const emitter: WeakEmitter<number> = new WeakEmitter<number>();
        emitter.event(testHandler);

        const weakTestHandler: WeakRef<any> = new WeakRef(testHandler);
        testHandler = null;

        expect(weakTestHandler.deref()).toBeDefined();

        await waitForFinalize(weakTestHandler);

        expect(weakTestHandler.deref()).toBeUndefined();

        expect(testNumber).toBe(0);

        emitter.fire(5);

        expect(testNumber).toBe(0);
    });

    test('Listener which is finalized is removed during fire', async () => {
        expect(gc).toBeDefined();

        let testHandler: ((newNumber: number) => void) | null = (_newNumber: number) => {
        };

        const emitter: WeakEmitter<number> = new WeakEmitter<number>();
        emitter.event(testHandler);

        const weakTestHandler: WeakRef<any> = new WeakRef(testHandler);
        testHandler = null;

        expect(weakTestHandler.deref()).toBeDefined();

        await waitForFinalize(weakTestHandler);

        expect(weakTestHandler.deref()).toBeUndefined();
        expect(emitter.listenerCount).toBe(1);

        emitter.fire(5);

        expect(emitter.listenerCount).toBe(0);
    });

    test('Adding the same listener twice is called once during fire', () => {
        let testNumber: number = 0;
        let count: number = 0;

        const listener: (newNumber: number) => void = (newNumber: number) => {
            testNumber = newNumber;
            count++;
        };

        const emitter: WeakEmitter<number> = new WeakEmitter<number>();
        emitter.event(listener);
        emitter.event(listener);

        expect(testNumber).toBe(0);

        emitter.fire(5);

        expect(testNumber).toBe(5);
        expect(count).toBe(1);
        expect(emitter.listenerCount).toBe(1);
    });

    test('Adding the same listener twice and disposing both does not throw', () => {
        let testNumber: number = 0;
        let count: number = 0;

        const listener: (newNumber: number) => void = (newNumber: number) => {
            testNumber = newNumber;
            count++;
        };

        const emitter: WeakEmitter<number> = new WeakEmitter<number>();
        const tokenA: IDisposable = emitter.event(listener);
        const tokenB: IDisposable = emitter.event(listener);

        expect(testNumber).toBe(0);

        emitter.fire(5);

        expect(testNumber).toBe(5);
        expect(count).toBe(1);
        expect(emitter.listenerCount).toBe(1);

        tokenA[Symbol.dispose]();
        tokenB[Symbol.dispose]();

        expect(emitter.listenerCount).toBe(0);
    });

    test('Disposing a listener removes the event handler', () => {
        let testNumber: number = 0;

        const emitter: WeakEmitter<number> = new WeakEmitter<number>(FireMode.Synchronous);
        const listener: IDisposable = emitter.event((newNumber: number) => {
            testNumber = newNumber;
        });

        expect(testNumber).toBe(0);
        emitter.fire(5);
        expect(testNumber).toBe(5);
        listener[Symbol.dispose]();
        emitter.fire(10);
        expect(testNumber).toBe(5);
    });

    test('Disposing a listener after the emitter does nothing', () => {
        const emitter: WeakEmitter<number> = new WeakEmitter<number>();
        const listener: IDisposable = emitter.event((_a: number) => { });
        emitter[Symbol.dispose]();
        listener[Symbol.dispose]();
    });

    test('Fire after dispose causes an exception', () => {
        const emitter: WeakEmitter<number> = new WeakEmitter<number>();
        emitter[Symbol.dispose]();
        expect(() => {
            emitter.fire(5);
        }).toThrow();
    });

    test('Getting event after dispose causes an exception', () => {
        const emitter: WeakEmitter<number> = new WeakEmitter<number>();
        emitter[Symbol.dispose]();
        expect(() => {
            emitter.event((_a: number) => { });
        }).toThrow();
    });

    test('Clear after dispose causes an exception', () => {
        const emitter: WeakEmitter<number> = new WeakEmitter<number>();
        emitter[Symbol.dispose]();
        expect((_a: number) => {
            emitter.clear();
        }).toThrow();
    });

    test('Fire Synchronous', () => {
        let testNumber: number = 0;

        const emitter: WeakEmitter<number> = new WeakEmitter<number>(FireMode.Synchronous);
        emitter.event((newNumber: number) => {
            testNumber = newNumber;
        });

        expect(testNumber).toBe(0);
        emitter.fire(5);
        expect(testNumber).toBe(5);
    });

    test('Removing listener in the event handler for a prior listener still fires event', () => {
        let testNumberA: number = 0;
        let testNumberB: number = 0;
        let first: boolean = true;

        const emitter: WeakEmitter<number> = new WeakEmitter<number>(FireMode.Synchronous);

        // The order in which listeners are called is undefined by the public interface of Emitter
        // so do not rely on ordering in this test
        const listenerA: IDisposable = emitter.event((newNumber: number) => {
            testNumberA = newNumber;
            if (first) {
                first = false;
                listenerB[Symbol.dispose]();
            }
        });
        const listenerB: IDisposable = emitter.event((newNumber: number) => {
            testNumberB = newNumber;
            if (first) {
                first = false;
                listenerA[Symbol.dispose]();
            }
        });

        expect(testNumberA).toBe(0);
        expect(testNumberB).toBe(0);

        emitter.fire(5);

        // The event should be received by both
        expect(testNumberA).toBe(5);
        expect(testNumberB).toBe(5);

        // Now the event should only be received by one
        emitter.fire(10);
        expect(testNumberA !== testNumberB);
    });

    test('Fire Microtask', async () => {
        let testNumber: number = 0;

        const emitter: WeakEmitter<number> = new WeakEmitter<number>(FireMode.Microtask);
        emitter.event((newNumber: number) => {
            testNumber = newNumber;
        });

        expect(testNumber).toBe(0);
        emitter.fire(5);
        expect(testNumber).toBe(0);

        await null;
        expect(testNumber).toBe(5);
    });


    test('Disposing emitter before microtask does not fire event', async () => {
        let testNumber: number = 0;

        const emitter: WeakEmitter<number> = new WeakEmitter<number>(FireMode.Microtask);
        emitter.event((newNumber: number) => {
            testNumber = newNumber;
        });

        expect(testNumber).toBe(0);
        emitter.fire(5);
        expect(testNumber).toBe(0);

        emitter[Symbol.dispose]();
        await null;
        expect(testNumber).toBe(0);
    });

    test('Removing listener before microtask does not fire event', async () => {
        let testNumber: number = 0;

        const emitter: WeakEmitter<number> = new WeakEmitter<number>(FireMode.Microtask);
        const listener: IDisposable = emitter.event((newNumber: number) => {
            testNumber = newNumber;
        });

        expect(testNumber).toBe(0);
        emitter.fire(5);
        expect(testNumber).toBe(0);

        listener[Symbol.dispose]();
        await null;
        expect(testNumber).toBe(0);
    });

    test('Fire Debounce', async () => {
        let testNumber: number = 0;
        let count: number = 0;

        const emitter: WeakEmitter<number> = new WeakEmitter<number>(FireMode.Debounce);
        emitter.event((newNumber: number) => {
            testNumber = newNumber;
            count++;
        });

        expect(testNumber).toBe(0);
        emitter.fire(5);
        emitter.fire(6);
        emitter.fire(7);
        emitter.fire(8);
        expect(testNumber).toBe(0);
        expect(count).toBe(0);

        await null;
        expect(testNumber).toBe(8);
        expect(count).toBe(1);
    });

    test('Disposing emitter before debounce does not fire event', async () => {
        let testNumber: number = 0;

        const emitter: WeakEmitter<number> = new WeakEmitter<number>(FireMode.Debounce);
        emitter.event((newNumber: number) => {
            testNumber = newNumber;
        });

        expect(testNumber).toBe(0);
        emitter.fire(5);
        expect(testNumber).toBe(0);

        emitter[Symbol.dispose]();
        await null;
        expect(testNumber).toBe(0);
    });

    test('Removing listener before debounce does not fire event', async () => {
        let testNumber: number = 0;

        const emitter: WeakEmitter<number> = new WeakEmitter<number>(FireMode.Debounce);
        const listener: IDisposable = emitter.event((newNumber: number) => {
            testNumber = newNumber;
        });

        expect(testNumber).toBe(0);
        emitter.fire(5);
        expect(testNumber).toBe(0);

        listener[Symbol.dispose]();
        await null;
        expect(testNumber).toBe(0);
    });

    test('Fire Microtask | Debounce', async () => {
        let testNumber: number = 0;
        let count: number = 0;

        const emitter: WeakEmitter<number> = new WeakEmitter<number>(FireMode.Microtask | FireMode.Debounce);
        emitter.event((newNumber: number) => {
            testNumber = newNumber;
            count++;
        });

        expect(testNumber).toBe(0);
        emitter.fire(5);
        emitter.fire(6);
        emitter.fire(7);
        emitter.fire(8);
        expect(testNumber).toBe(0);

        await null;
        expect(testNumber).toBe(8);
        // note the 5, 4 times for Microtask and once more for Debounce
        expect(count).toBe(5);
    });
});