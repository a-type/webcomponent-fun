import { define, natives, from, makeStore } from '../../index';

const appState = makeStore({
  timerRunning: true,
});

const counter = define<{ count: number; running: boolean }>(
  'counter',
  ({ count, running }, { ui, watch }) => {
    /**
     * Shadow DOM scoped styles
     */
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

    /**
     * Shadow DOM template
     */
    ui(
      natives.span({
        class: 'counter',
        children: count,
      }),
    );

    /**
     * Watching a reactive value and changing
     * things
     */
    watch([running], (running) => {
      if (running) {
        /**
         * If the timer is running, create an interval
         * to periodically increment the counter
         * value
         */
        const interval = setInterval(() => {
          count.value++;
        }, 1000);
        // return a cleanup to clear the interval
        return () => {
          clearInterval(interval);
        };
      } else {
        /**
         * If the timer is not running, append a note
         * in the Shadow DOM to indicate that.
         * Returns a cleanup to remove the note element.
         */
        return ui(
          natives.span({
            class: 'paused-note',
            children: '(paused)',
          }),
        );
      }
    });
  },
);

const root = natives.div({
  children: [
    natives.div({
      children: counter({
        count: 0,
        running: appState.timerRunning,
      }),
    }),
    natives.button({
      onclick: () => {
        appState.timerRunning.set(!appState.timerRunning.value);
      },
      children: [
        'Toggle: ',
        from(appState.timerRunning, (running) => (running ? 'On' : 'Off')),
      ],
    }),
  ],
});

document.body.appendChild(root.element);
