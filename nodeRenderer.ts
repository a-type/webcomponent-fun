import { applyAttribute } from './attributes';
import { ReactiveComponent } from './define';

export type RenderedNode = {
  element: Element;
  cleanup: () => void;
};

export type NodeRendererFn<Props> = (props: Props) => RenderedNode;

export function createNodeRenderer<Props>(tag: string) {
  return function (props: Props) {
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
