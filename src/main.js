import PrimeVue from 'primevue/config';

import { createApp, ref } from 'vue';

import { store } from '@/store';
import router from '@/router';

import App from '@/App.vue';

import ToastService from 'primevue/toastservice';

import 'primeflex/primeflex.css';
import 'primevue/resources/themes/lara-light-indigo/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

import Tooltip from 'primevue/tooltip';

import UserService from '@/api/UserService';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/ru';

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.locale('ru');

/* ------------------------------- */

createApp(App)
  .use(store)
  .use(router)
  .use(PrimeVue)
  .use(ToastService)
  .directive('tooltip', Tooltip)
  .mount('#app');

const userService = ref(new UserService());

const token = localStorage.getItem('token');

if (token && !store.state.main.user) {
  userService.value.GetCurrentUser().then((response) => {
    const { isError, body } = response || {};
    if (!isError && body) store.commit('main/userSet', body);
  });
}
