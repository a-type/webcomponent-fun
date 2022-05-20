import { applyAttribute } from './attributes';
import { ReactiveComponent } from './define';
import { ReactiveValue } from './reactives';

export type RenderedNode = {
  element: Element;
  cleanup: () => void;
};

export type NodeRendererFn<Props> = (props: Props) => RenderedNode;

type PropsOrReactives<Props> = {
  [K in keyof Props]: Props[K] extends ReactiveValue
    ? Props[K]
    : Props[K] | ReactiveValue<Props[K]>;
};

export function createNodeRenderer<Props>(tag: string) {
  return function (props: PropsOrReactives<Props>) {
    const element = document.createElement(tag);
    if (element instanceof ReactiveComponent) {
      element.setProps(props);
    }
    for (const [name, value] of Object.entries(props)) {
      applyAttribute(element, name, value);
    }
    return {
      element,
      cleanup: () => {
        element.remove();
      },
    };
  };
}
