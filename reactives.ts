import { applyAttribute } from './attributes';

const reactiveTag = Symbol('@@isReactiveValue');
const subscribers = Symbol('@@subscribers');
const wrappedProps = Symbol('@@wrappedProps');

export type BaseReactiveValue<T = unknown> = {
  [reactiveTag]: true;
  [subscribers]: Set<(value: T) => void>;
  [wrappedProps]: T extends Record<any, any> ? WrapReactiveProps<T> : {};
  get(): T;
  set(value: T): void;
  subscribe(callback: (value: T) => void): () => void;
  value: T;
};

export function isReactiveValue(value: any): value is ReactiveValue<any> {
  return value && value[reactiveTag];
}

export type ReactiveList = Array<ReactiveValue<unknown>>;

export type UnwrappedReactiveList<List extends ReactiveList> = {
  [K in keyof List]: List[K] extends ReactiveValue<infer T> ? T : never;
};

export type UnwrappedReactive<T extends ReactiveValue> =
  T extends ReactiveValue<infer U> ? U : never;

export type UnwrappedAnyReactiveAsList<T extends ReactiveValue | ReactiveList> =
  T extends ReactiveValue<infer U>
    ? [U]
    : T extends ReactiveList
    ? UnwrappedReactiveList<T>
    : never;

export type WrapReactiveProps<T extends unknown> = T extends Record<any, any>
  ? {
      [K in keyof T]: T[K] extends ReactiveValue<any>
        ? T[K]
        : ReactiveValue<T[K]>;
    }
  : {};

export type ReactiveValue<T extends unknown = any> = BaseReactiveValue<T> &
  WrapReactiveProps<T>;

export function wrapReactive<T>(value: T): ReactiveValue<T> {
  if (isReactiveValue(value)) return value as unknown as ReactiveValue<T>;

  // a stable reference object which contains the current
  // value of the reactive
  const valueContainer = {
    current: value,
  };

  // keep stable references to wrapped reactive prop values
  const wrappedPropsContainer = {} as WrapReactiveProps<T>;

  return new Proxy(
    {
      [reactiveTag]: true,
      [subscribers]: new Set(),
      [wrappedProps]: wrappedPropsContainer,
      get value() {
        return valueContainer.current;
      },
      set value(newValue) {
        this.set(newValue);
      },

      get() {
        return valueContainer.current;
      },
      set(newValue: T) {
        if (valueContainer.current === newValue) return;
        valueContainer.current = newValue;
        for (const callback of this[subscribers]) {
          callback(newValue);
        }
      },
      subscribe(callback: (value: T) => void) {
        const unsubscribe = () => {
          this[subscribers].delete(callback);
        };
        this[subscribers].add(callback);
        return unsubscribe;
      },
    } as any,
    {
      set(target, key, value) {
        if (key === 'value') {
          target.set(value);
          return true;
        }
        return false;
      },
      // wraps all properties in reactives, recursively
      get(target, key) {
        if (key === 'value') return valueContainer.current;
        if (
          key === 'get' ||
          key === 'set' ||
          key === 'subscribe' ||
          key === subscribers ||
          key === reactiveTag
        ) {
          return Reflect.get(target, key);
        } else {
          const val = valueContainer.current[key];
          if (isReactiveValue(val)) {
            return val;
          } else {
            if (wrappedPropsContainer[key] === undefined) {
              wrappedPropsContainer[key] = wrapReactive(val);
            }
            return wrappedPropsContainer[key];
          }
        }
      },
    },
  );
}

export function from<In extends ReactiveValue | ReactiveList, Out>(
  dependencies: In,
  process: (...dependencies: UnwrappedAnyReactiveAsList<In>) => Out,
) {
  const depsArray = Array.isArray(dependencies) ? dependencies : [dependencies];
  const collapseDependencies = () =>
    depsArray.map((dep) => dep.get()) as UnwrappedAnyReactiveAsList<In>;
  const reactive = wrapReactive(process(...collapseDependencies()));
  for (const dependency of depsArray) {
    dependency.subscribe(() => {
      reactive.set(process(...collapseDependencies()));
    });
  }
  return reactive;
}
