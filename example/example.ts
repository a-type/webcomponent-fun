import { define, natives } from '../index';
import { makeStore } from '../store';

const appState = makeStore({
  timerRunning: true,
});

const counter = define<{ count: number; running: boolean }>(
  'counter',
  (props, { ui, watch }) => {
    const count = props.count;

    ui(
      natives.style({
        children: `
          .counter {
            margin: 8px;
          }
          .paused-note {
            opacity: 0.5;
          }
        `,
      }),
    );

    ui(
      natives.span({
        class: 'counter',
        children: count,
      }),
    );

    watch(
      (running) => {
        if (running) {
          const interval = setInterval(() => {
            props.count.value++;
          }, 1000);
          return () => {
            clearInterval(interval);
          };
        } else {
          return ui(
            natives.span({
              class: 'paused-note',
              children: '(paused)',
            }),
          );
        }
      },
      [props.running],
    );
  },
);

const root = natives.div({
  children: [
    counter({
      count: 0,
      running: appState.timerRunning,
    }).element,
    natives.button({
      onclick: () => {
        appState.timerRunning.set(!appState.timerRunning.value);
      },
      children: ['Toggle: ', appState.timerRunning],
    }).element,
  ],
}).element;

document.body.appendChild(root);
