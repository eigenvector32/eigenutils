// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { DependencyState } from "../IDependency";
import { BaseDependencyContainer, DependencyContainerState, isIDependencyContainer } from "../IDependencyContainer";
import { MockDependency } from "./MockDependency";

describe('Tests for BaseDependencyContainer', () => {
    test('isIDependencyContainer', () => {
        const container: BaseDependencyContainer = new BaseDependencyContainer();
        expect(isIDependencyContainer(container)).toBe(true);
    });

    test('Initial dependencyContainerState', () => {
        const container: BaseDependencyContainer = new BaseDependencyContainer();
        expect(container.dependencyContainerState).toBe(DependencyContainerState.Uninitialized);
    });

    test('dependencyContainerState changes when dependencies are added', () => {
        const container: BaseDependencyContainer = new BaseDependencyContainer();
        expect(container.dependencyContainerState).toBe(DependencyContainerState.Uninitialized);

        container.addDependency("MockDependency", new MockDependency(DependencyState.Initialized));
        expect(container.dependencyContainerState).toBe(DependencyContainerState.Initialized);
    });

    test('dependencyContainerState changes when dependencies update', () => {
        const container: BaseDependencyContainer = new BaseDependencyContainer();
        expect(container.dependencyContainerState).toBe(DependencyContainerState.Uninitialized);
        const mock: MockDependency = new MockDependency(DependencyState.Uninitialized);
        container.addDependency("MockDependency", mock);
        expect(container.dependencyContainerState).toBe(DependencyContainerState.Uninitialized);
        mock.setDependencyState(DependencyState.Initializing);
        expect(container.dependencyContainerState).toBe(DependencyContainerState.Initializing);
        mock.setDependencyState(DependencyState.Initialized);
        expect(container.dependencyContainerState).toBe(DependencyContainerState.Initialized);
    });

    test('dependencyContainerState is set by the least initialized dependency', () => {
        const container: BaseDependencyContainer = new BaseDependencyContainer();
        expect(container.dependencyContainerState).toBe(DependencyContainerState.Uninitialized);
        const mockA: MockDependency = new MockDependency(DependencyState.Uninitialized);
        const mockB: MockDependency = new MockDependency(DependencyState.Uninitialized);
        const mockC: MockDependency = new MockDependency(DependencyState.Uninitialized);
        container.addDependency("MockDependencyA", mockA);
        container.addDependency("MockDependencyB", mockB);
        container.addDependency("MockDependencyC", mockC);
        expect(container.dependencyContainerState).toBe(DependencyContainerState.Uninitialized);
        mockA.setDependencyState(DependencyState.Initialized);
        expect(container.dependencyContainerState).toBe(DependencyContainerState.Uninitialized);
        mockB.setDependencyState(DependencyState.Initialized);
        expect(container.dependencyContainerState).toBe(DependencyContainerState.Uninitialized);
        mockC.setDependencyState(DependencyState.Initializing);
        expect(container.dependencyContainerState).toBe(DependencyContainerState.Initializing);
        mockC.setDependencyState(DependencyState.Initialized);
        expect(container.dependencyContainerState).toBe(DependencyContainerState.Initialized);
    });

    test('getInitializedPromise', async () => {
        const container: BaseDependencyContainer = new BaseDependencyContainer();
        expect(container.dependencyContainerState).toBe(DependencyContainerState.Uninitialized);
        const mock: MockDependency = new MockDependency(DependencyState.Uninitialized);
        container.addDependency("MockDependency", mock);
        expect(container.dependencyContainerState).toBe(DependencyContainerState.Uninitialized);
        mock.setDependencyStateOnTimeout(DependencyState.Initialized, 50);
        expect(container.dependencyContainerState).toBe(DependencyContainerState.Uninitialized);
        await container.getInitializedPromise();
        expect(container.dependencyContainerState).toBe(DependencyContainerState.Initialized);
    });
});