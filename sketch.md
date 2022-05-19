```tsx
/** How a component is defined... */

export function counter({
  count,
  running,
}: {
  count: number;
  running: boolean;
}) {
  // TODO: how do you create markup?
}
counter.name = 'a-counter';

/** How a binding is defined... */
import { counter } from 'counter';
import { app, page } from 'stores';

export function pageCounter() {
  return counter({
    count: page.count,
    running: app.countersRunning,
  });
}

/** How children work? */

export function parent({
  child,
  otherChild,
}: {
  child: Component;
  otherChild: Component;
}) {
  return div({
    class: 'parent',
    children: list(child, otherChild),
  });
}
```

So basically props can include reactive data or rendered components.

Probably makes sense to export something that's run through a function rather than a function itself.

```tsx
export const Counter = define<{ count: number; running: boolean }>(
  ({ count, running }, r) => {
    return r(span, {
      class: 'counter',
      children: r.get(count),
    });
  },
);
```

`r` here lets you create closures to use for state and reactivity and stuff.

What does reactivity even mean in a DOM-only world?

I guess, like, when a component would set an attribute to a reactive value, it instead subscribes to that value and updates the attribute when it changes?

# maybe not declarative?

Declarativity is convenient but it also requires diffing, and that starts to feel heavy?

What happens if it provides a hook to react to property changes and you have to decide what to do with it?

A problem with imperative approaches is a potential for a lot of checking of props and updating them. Say a component has 30 props, that's a ton of code to write to react to which ones change.

The reactive values thing still holds water. What if element rendering is imperative, but bound properties are reactive?

```tsx

```

# what does a reactive value look like and how do you use it?

just using primitive values would be so much nicer, but I explicitly don't want to introduce compiler magic.

oh well. it could look like this.

```ts
const count = r(0);
count.get();
count.set(1);
// proxy?
count.value++;
```

# how to make things reactive in practice

```tsx
export const Counter = define<{ count: number; running: boolean }>(
  ({ count, running }, { shadow }) => {
    return shadow(span, {
      class: 'counter',
      children: count,
    });
  },
);
```

# how to watch values to run side effects

```tsx
export const Counter = define<{ count: number; running: boolean }>(
  ({ count, running }, { watch }) => {
    watch(
      (count) => {
        alert(count);
      },
      [count],
    );
  },
);
```

# how to do event handlers

```tsx
export const Counter = define<{ count: number; running: boolean }>(
  ({ count, running }, { shadow, reactive }) => {
    return shadow(button, {
      class: 'counter',
      children: count,
      onclick: () => {
        count.value++;
      },
    });
  },
);
```
