import { wrapReactive } from './reactives';

export function makeStore<T extends Record<any, any>>(initialState: T) {
  return wrapReactive(initialState);
}
