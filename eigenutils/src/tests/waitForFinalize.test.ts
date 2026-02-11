import "./globalGC";
import { waitForFinalize } from "./waitForFinalize";

describe('Tests for waitForFinalize', () => {
    test('waitForFinalize resolves before timeout', async () => {
        expect(gc).toBeDefined();

        let testData: any = {
            content: "foo"
        };
        const weakTestData: WeakRef<any> = new WeakRef(testData);
        testData = null;

        expect(weakTestData.deref()).toBeDefined();

        await waitForFinalize(weakTestData);

        expect(weakTestData.deref()).toBeUndefined();
    });
});
