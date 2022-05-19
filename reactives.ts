import { applyAttribute } from './attributes';

const reactiveTag = Symbol('@@isReactiveValue');
const subscribers = Symbol('@@subscribers');
const wrappedProps = Symbol('@@wrappedProps');

export type BaseReactiveValue<T> = {
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

export type ReactiveList = Array<ReactiveValue<any>>;

export type UnwrappedReactiveList<List extends ReactiveList> = {
  [K in keyof List]: List[K] extends ReactiveValue<infer T> ? T : never;
};

export type WrapReactiveProps<T extends Record<any, any>> = {
  [K in keyof T]: T[K] extends ReactiveValue<any> ? T[K] : ReactiveValue<T[K]>;
};

export type ReactiveValue<T extends Record<any, any>> = BaseReactiveValue<T> &
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
        console.log(
          `Value set: ${JSON.stringify(newValue)} (was: ${JSON.stringify(
            valueContainer.current,
          )})`,
        );
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
