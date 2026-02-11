import { MultiArgEmitter } from "../MultiArgEmitter";
import { FireMode } from "../FireMode";
import { IDisposable } from "../../IDisposable";

describe('Tests for MultiArgEmitter', () => {
    test('Adding the same listener twice is called once during fire', () => {
        let testNumber: number = 0;
        let testString: string = "";
        let count: number = 0;

        const listener: (newNumber: number, newString: string) => void = (newNumber: number, newString: string) => {
            testNumber = newNumber;
            testString = newString;
            count++;
        };

        const emitter: MultiArgEmitter<[number, string]> = new MultiArgEmitter<[number, string]>();
        emitter.event(listener);
        emitter.event(listener);

        expect(testNumber).toBe(0);
        expect(testString).toBe("");

        emitter.fire(5, "a");

        expect(testNumber).toBe(5);
        expect(testString).toBe("a");
        expect(count).toBe(1);
        expect(emitter.listenerCount).toBe(1);
    });

    test('Adding the same listener twice and disposing both does not throw', () => {
        let testNumber: number = 0;
        let testString: string = "";
        let count: number = 0;

        const listener: (newNumber: number, newString: string) => void = (newNumber: number, newString: string) => {
            testNumber = newNumber;
            testString = newString;
            count++;
        };

        const emitter: MultiArgEmitter<[number, string]> = new MultiArgEmitter<[number, string]>();
        const tokenA: IDisposable = emitter.event(listener);
        const tokenB: IDisposable = emitter.event(listener);

        expect(testNumber).toBe(0);
        expect(testString).toBe("");

        emitter.fire(5, "a");

        expect(testNumber).toBe(5);
        expect(testString).toBe("a");
        expect(count).toBe(1);
        expect(emitter.listenerCount).toBe(1);

        tokenA[Symbol.dispose]();
        tokenB[Symbol.dispose]();

        expect(emitter.listenerCount).toBe(0);
    });

    test('Disposing a listener removes the event handler', () => {
        let testNumber: number = 0;
        let testString: string = "";

        const emitter: MultiArgEmitter<[number, string]> = new MultiArgEmitter<[number, string]>(FireMode.Synchronous);
        const listener: IDisposable = emitter.event((newNumber: number, newString: string) => {
            testNumber = newNumber;
            testString = newString;
        });

        expect(testNumber).toBe(0);
        expect(testString).toBe("");
        emitter.fire(5, "a");
        expect(testNumber).toBe(5);
        expect(testString).toBe("a");
        listener[Symbol.dispose]();
        emitter.fire(10, "b");
        expect(testNumber).toBe(5);
        expect(testString).toBe("a");
    });

    test('Disposing a listener after the emitter does nothing', () => {
        const emitter: MultiArgEmitter<[number, string]> = new MultiArgEmitter<[number, string]>();
        const listener: IDisposable = emitter.event((_a: number, _b: string) => { });
        emitter[Symbol.dispose]();
        listener[Symbol.dispose]();
    });

    test('Fire after dispose causes an exception', () => {
        const emitter: MultiArgEmitter<[number, string]> = new MultiArgEmitter<[number, string]>();
        emitter[Symbol.dispose]();
        expect(() => {
            emitter.fire(5, "foo");
        }).toThrow();
    });

    test('Getting event after dispose causes an exception', () => {
        const emitter: MultiArgEmitter<[number, string]> = new MultiArgEmitter<[number, string]>();
        emitter[Symbol.dispose]();
        expect(() => {
            emitter.event((_a: number, _b: string) => { });
        }).toThrow();
    });

    test('Clear after dispose causes an exception', () => {
        const emitter: MultiArgEmitter<[number, string]> = new MultiArgEmitter<[number, string]>();
        emitter[Symbol.dispose]();
        expect((_a: number, _b: string) => {
            emitter.clear();
        }).toThrow();
    });

    test('Fire Synchronous', () => {
        let testNumber: number = 0;
        let testString: string = "";

        const emitter: MultiArgEmitter<[number, string]> = new MultiArgEmitter<[number, string]>(FireMode.Synchronous);
        emitter.event((newNumber: number, newString: string) => {
            testNumber = newNumber;
            testString = newString;
        });

        expect(testNumber).toBe(0);
        expect(testString).toBe("");
        emitter.fire(5, "a");
        expect(testNumber).toBe(5);
        expect(testString).toBe("a");
    });

    test('Removing listener in the event handler for a prior listener still fires event', () => {
        let testNumberA: number = 0;
        let testNumberB: number = 0;
        let testStringA: string = "";
        let testStringB: string = "";
        let first: boolean = true;

        const emitter: MultiArgEmitter<[number, string]> = new MultiArgEmitter<[number, string]>(FireMode.Synchronous);

        // The order in which listeners are called is undefined by the public interface of Emitter
        // so do not rely on ordering in this test
        const listenerA: IDisposable = emitter.event((newNumber: number, newString: string) => {
            testNumberA = newNumber;
            testStringA = newString;
            if (first) {
                first = false;
                listenerB[Symbol.dispose]();
            }
        });
        const listenerB: IDisposable = emitter.event((newNumber: number, newString: string) => {
            testNumberB = newNumber;
            testStringB = newString;
            if (first) {
                first = false;
                listenerA[Symbol.dispose]();
            }
        });

        expect(testNumberA).toBe(0);
        expect(testStringA).toBe("");
        expect(testNumberB).toBe(0);
        expect(testStringB).toBe("");

        emitter.fire(5, "a");

        // The event should be received by both
        expect(testNumberA).toBe(5);
        expect(testStringA).toBe("a");
        expect(testNumberB).toBe(5);
        expect(testStringB).toBe("a");

        // Now the event should only be received by one
        emitter.fire(10, "b");
        expect(testNumberA !== testNumberB);
        expect(testStringA !== testStringB);
    });

    test('Fire Microtask', async () => {
        let testNumber: number = 0;
        let testString: string = "";

        const emitter: MultiArgEmitter<[number, string]> = new MultiArgEmitter<[number, string]>(FireMode.Microtask);
        emitter.event((newNumber: number, newString: string) => {
            testNumber = newNumber;
            testString = newString;
        });

        expect(testNumber).toBe(0);
        expect(testString).toBe("");
        emitter.fire(5, "a");
        expect(testNumber).toBe(0);
        expect(testString).toBe("");

        await null;
        expect(testNumber).toBe(5);
        expect(testString).toBe("a");
    });


    test('Disposing emitter before microtask does not fire event', async () => {
        let testNumber: number = 0;
        let testString: string = "";

        const emitter: MultiArgEmitter<[number, string]> = new MultiArgEmitter<[number, string]>(FireMode.Microtask);
        emitter.event((newNumber: number, newString: string) => {
            testNumber = newNumber;
            testString = newString;
        });

        expect(testNumber).toBe(0);
        expect(testString).toBe("");
        emitter.fire(5, "a");
        expect(testNumber).toBe(0);
        expect(testString).toBe("");

        emitter[Symbol.dispose]();
        await null;
        expect(testNumber).toBe(0);
        expect(testString).toBe("");
    });

    test('Removing listener before microtask does not fire event', async () => {
        let testNumber: number = 0;
        let testString: string = "";

        const emitter: MultiArgEmitter<[number, string]> = new MultiArgEmitter<[number, string]>(FireMode.Microtask);
        const listener: IDisposable = emitter.event((newNumber: number, newString: string) => {
            testNumber = newNumber;
            testString = newString;
        });

        expect(testNumber).toBe(0);
        expect(testString).toBe("");
        emitter.fire(5, "a");
        expect(testNumber).toBe(0);
        expect(testString).toBe("");

        listener[Symbol.dispose]();
        await null;
        expect(testNumber).toBe(0);
        expect(testString).toBe("");
    });

    test('Fire Debounce', async () => {
        let testNumber: number = 0;
        let testString: string = "";
        let count: number = 0;

        const emitter: MultiArgEmitter<[number, string]> = new MultiArgEmitter<[number, string]>(FireMode.Debounce);
        emitter.event((newNumber: number, newString: string) => {
            testNumber = newNumber;
            testString = newString;
            count++;
        });

        expect(testNumber).toBe(0);
        expect(testString).toBe("");
        emitter.fire(5, "a");
        emitter.fire(6, "b");
        emitter.fire(7, "c");
        emitter.fire(8, "d");
        expect(testNumber).toBe(0);
        expect(testString).toBe("");
        expect(count).toBe(0);

        await null;
        expect(testNumber).toBe(8);
        expect(testString).toBe("d");
        expect(count).toBe(1);
    });

    test('Disposing emitter before debounce does not fire event', async () => {
        let testNumber: number = 0;
        let testString: string = "";

        const emitter: MultiArgEmitter<[number, string]> = new MultiArgEmitter<[number, string]>(FireMode.Debounce);
        emitter.event((newNumber: number, newString: string) => {
            testNumber = newNumber;
            testString = newString;
        });

        expect(testNumber).toBe(0);
        expect(testString).toBe("");
        emitter.fire(5, "a");
        expect(testNumber).toBe(0);
        expect(testString).toBe("");

        emitter[Symbol.dispose]();
        await null;
        expect(testNumber).toBe(0);
        expect(testString).toBe("");
    });

    test('Removing listener before debounce does not fire event', async () => {
        let testNumber: number = 0;
        let testString: string = "";

        const emitter: MultiArgEmitter<[number, string]> = new MultiArgEmitter<[number, string]>(FireMode.Debounce);
        const listener: IDisposable = emitter.event((newNumber: number, newString: string) => {
            testNumber = newNumber;
            testString = newString;
        });

        expect(testNumber).toBe(0);
        expect(testString).toBe("");
        emitter.fire(5, "a");
        expect(testNumber).toBe(0);
        expect(testString).toBe("");

        listener[Symbol.dispose]();
        await null;
        expect(testNumber).toBe(0);
        expect(testString).toBe("");
    });

    test('Fire Microtask | Debounce', async () => {
        let testNumber: number = 0;
        let testString: string = "";
        let count: number = 0;

        const emitter: MultiArgEmitter<[number, string]> = new MultiArgEmitter<[number, string]>(FireMode.Microtask | FireMode.Debounce);
        emitter.event((newNumber: number, newString: string) => {
            testNumber = newNumber;
            testString = newString;
            count++;
        });

        expect(testNumber).toBe(0);
        expect(testString).toBe("");
        emitter.fire(5, "a");
        emitter.fire(6, "b");
        emitter.fire(7, "c");
        emitter.fire(8, "d");
        expect(testNumber).toBe(0);
        expect(testString).toBe("");

        await null;
        expect(testNumber).toBe(8);
        expect(testString).toBe("d");
        // note the 5, 4 times for Microtask and once more for Debounce
        expect(count).toBe(5);
    });
});
