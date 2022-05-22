/**
 * Creates a Proxy wrapper for any object/array value
 * which acts as a tree of tracking reactive values,
 * down to the primitive leaf nodes, which are essentially
 * reactive ref containers.
 *
 * const value = reactive({
 *  a: {
 *   b: {
 *    c: 'hello',
 *   },
 *  },
 * });
 *
 * value.a.b.c.value // 'hello'
 * value.a.b.c.set('goodbye');
 * value.a.b // Proxy{ c: Proxy{'goodbye'} };
 *
 * Additionally, any Proxy reactive must be referentially
 * equal to another Proxy reactive if the targets are 'the same'
 * this is done with a WeakMap
 */
