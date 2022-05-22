import { reactive } from './reactives2';

export function makeStore<T extends Record<any, any>>(initialState: T) {
  return reactive(initialState);
}
