import { define, makeStore, natives, from, wrapReactive } from '../../index';

type TodoItemData = {
  id: number;
  text: string;
  done: boolean;
};

const appState = makeStore({
  input: '',
  todos: [
    {
      id: 0,
      text: 'Get tired of React',
      done: true,
    },
    {
      id: 1,
      text: 'Make a webcomponent framework',
      done: false,
    },
  ],
});

const todoItem = define<TodoItemData>(
  'todo-item',
  ({ id, text, done }, { ui, watch }) => {
    ui(
      natives.style({
        children: `
          .todo-item {
            display: flex;
            align-items: center;
            padding: 8px;
          }
          .todo-item.done {
            opacity: 0.5;
            text-decoration: line-through;
          }
        `,
      }),
    );

    ui(
      natives.li({
        class: from(done, (done) => (done ? 'todo-item done' : 'todo-item')),
        children: [
          natives.input({
            type: 'checkbox',
            checked: done,
            onchange: () => {
              done.value = !done.value;
            },
          }),
          natives.span({
            children: text,
          }),
        ],
      }),
    );
  },
);

const todoList = define<{ todos: TodoItemData[] }>(
  'todo-list',
  ({ todos }, { ui, watch }) => {
    ui(
      natives.style({
        children: `
          .todo-list {
            display: flex;
            flex-direction: column;
          }
        `,
      }),
    );

    ui(
      natives.ul({
        class: 'todo-list',
        children: from(todos, (todos) => todos.map((todo) => todoItem(todo))),
      }),
    );
  },
);

const addTodo = define<{ text: string }>('add-todo', ({ text }, { ui }) => {
  ui(
    natives.style({
      children: `
          .add-todo {
            display: flex;
            align-items: center;
            padding: 8px;
          }
        `,
    }),
  );

  ui(
    natives.div({
      class: 'add-todo',
      children: [
        natives.input({
          type: 'text',
          value: text,
          onchange: (event) => {
            text.value = (event.target as HTMLInputElement).value;
          },
        }),
        natives.button({
          children: 'Add',
          onclick: () => {
            appState.todos.value.push({
              id: appState.todos.length,
              text: text.value,
              done: false,
            });
            text.value = '';
          },
        }),
      ],
    }),
  );
});

const root = natives.div({
  children: [
    todoList({
      todos: appState.todos,
    }),
    addTodo({
      text: appState.input,
    }),
  ],
});

document.body.appendChild(root.element);
