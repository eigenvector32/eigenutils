// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

export function waitForTimeout(timeout: number): Promise<void> {
    return new Promise<void>((resolve: () => void) => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}
