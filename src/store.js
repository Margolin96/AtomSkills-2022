import { createStore } from 'vuex';

import MainStore from '@/modules/main/store';

export const store = createStore({
  modules: {
    main: MainStore,
  },
});

export default store;
