import { action, createStore } from 'easy-peasy';

// 👇 create your store, providing the model
const store = createStore({
  todos: {
    items: ['Install easy-peasy', 'Define your model', 'Have fun'],
    // 👇 define actions directly on your model
    add: action((state, payload) => {
      // simply mutate state to update, and we convert to immutable updates
      console.log(state, payload)
      // (you can also return a new immutable version of state if you prefer)
    })
  }
});

export default store