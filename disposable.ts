export type Disposable<T> = {
  dispose(): void;
  readonly value: T;
};

export function disposable<T>(
  setup: () => T,
  dispose: (current: T) => void,
): Disposable<T> {
  return {
    dispose: () => dispose(this.value),
    value: setup(),
  };
}
