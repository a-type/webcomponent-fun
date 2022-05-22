import { define, makeStore, natives, from, reactive } from '../../index';

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
              done.current = !done.current;
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
        children: from(todos, (todos) => {
          console.log(todos);
          const result = todos.map((todo) => todoItem(todo));
          return result;
        }),
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
    natives.form({
      class: 'add-todo',
      onsubmit: (ev) => {
        ev.preventDefault();
        appState.todos.push(
          reactive({
            id: appState.todos.length,
            text: text.current,
            done: false,
          }),
        );
        text.current = '';
      },
      children: [
        natives.input({
          type: 'text',
          value: text,
          onchange: (event) => {
            text.current = (event.target as HTMLInputElement).value;
          },
        }),
        natives.button({
          children: 'Add',
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
