import { createNodeRenderer, RenderedNode } from './nodeRenderer';
import {
  ReactiveObject,
  UnwrappedListOfReactives,
  reactive,
  ListOfReactives,
  subscribe,
} from './reactives2';

type CleanupFn = () => void;

type WatchEffect = <Reactives extends ListOfReactives>(
  deps: Reactives,
  run: (...args: UnwrappedListOfReactives<Reactives>) => void | CleanupFn,
) => void;

type Tools = {
  cleanup: (fn: CleanupFn) => void;
  ui: (node: RenderedNode) => void;
  watch: WatchEffect;
  reactive: typeof reactive;
};

type CreatorFn<Props extends Record<any, any>> = (
  props: ReactiveObject<Props>,
  tools: Tools,
) => CleanupFn | void;

export class ReactiveComponent<
  Props extends Record<any, any>,
> extends HTMLElement {
  private _cleanups: CleanupFn[] = [];
  private shadow: ShadowRoot;
  private props: ReactiveObject<Props>;

  constructor(private _creator: CreatorFn<Props>) {
    super();
    this.shadow = this.shadowRoot || this.attachShadow({ mode: 'open' });
  }

  initialize = () => {
    const uncreate = this._creator(this.getProps(), {
      cleanup: (fn: CleanupFn) => {
        this._cleanups.push(fn);
      },
      ui: (node: RenderedNode) => {
        this.shadow.appendChild(node.element);
        this._cleanups.push(node.cleanup);
        return node.cleanup;
      },
      watch: (deps, run) => {
        let cleanup: CleanupFn | undefined = undefined;
        const callback = () => {
          if (cleanup) {
            cleanup();
          }
          cleanup =
            run(...(deps.map((dep) => dep.current) as any)) || undefined;
        };
        callback();
        const allCleanups = deps.map((dep) => subscribe(dep, callback));
        this._cleanups.push(() => {
          allCleanups.forEach((cleanup) => cleanup());
          if (cleanup) {
            cleanup();
          }
        });
      },
      reactive,
    });
    if (uncreate) {
      this._cleanups.push(uncreate);
    }
  };

  connectedCallback() {
    this.initialize();
  }

  setProps = (props: Props) => {
    this.props = reactive(props) as ReactiveObject<Props>;
  };

  getProps = (): ReactiveObject<Props> => {
    const props = this.props;
    // attribute overrides
    // for (const attr of this.attributes) {
    //   if (props[attr.name]) {
    //     props[attr.name].value = attr.value;
    //   }
    // }
    return props;
  };
}

export function define<Props>(name: string, creator: CreatorFn<Props>) {
  class DefinedComponent extends ReactiveComponent<Props> {
    constructor() {
      super(creator);
    }
  }

  customElements.define(`x-${name}`, DefinedComponent);

  return createNodeRenderer<Props>(`x-${name}`);
}
