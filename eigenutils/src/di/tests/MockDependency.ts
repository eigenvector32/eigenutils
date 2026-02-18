import { BaseDependency, DependencyState } from "../IDependency";

export class MockDependency extends BaseDependency {
    constructor(initialState: DependencyState = DependencyState.Uninitialized) {
        super();

        this._dependencyState = initialState;
    }

    public setDependencyState(state: DependencyState): void {
        if (state !== this._dependencyState) {
            this._dependencyState = state;
            this._dependencyStateChangedEmitter?.fire(this, this._dependencyState);
        }
    }

    public setDependencyStateOnTimeout(state: DependencyState, timeout: number): void {
        setTimeout(() => {
            this.setDependencyState(state);
        }, timeout);
    }
}