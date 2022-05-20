const { resolve } = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        counter: resolve(__dirname, 'counter/index.html'),
        todo: resolve(__dirname, 'todo/index.html'),
      },
    },
  },
});
