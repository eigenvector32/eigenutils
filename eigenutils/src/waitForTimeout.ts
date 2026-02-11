export function waitForTimeout(timeout: number): Promise<void> {
    return new Promise<void>((resolve: () => void) => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}
