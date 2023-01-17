/* System */
import { ref } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

/* Store modules */
import { store } from '@/store';

/* API Services */
import UserService from '@/api/UserService';

/* Routes */
import AuthRoutes from '@/modules/auth/routes';
import UserRoutes from '@/modules/user/routes';
import ClaimRoutes from '@/modules/claim/routes';

/* Variables */
const userService = ref(new UserService());

const routes = [
  ...ClaimRoutes, // Claims / Заявки
  ...UserRoutes, // Users / Пользователи (для админа)
  ...AuthRoutes, // Auth / Авторизация - регистрация
  // Claim / Заявка
  // Quality / Качество (аналитика)
];

/* Logic */
const Router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Router.beforeEach(async (to, from, next) => {
//   if (to.matched.some((record) => record.meta.onlyAuth)) {
//     if (!store.state.main.user) {
//       next({ name: 'login' });
//     } else {
//       next();
//     }
//   } else {
//     next();
//   }
// });

Router.beforeEach(async (to, from, next) => {
  const authRoute = 'login';

  // Страница доступна
  if (!to.meta.onlyAuth) next();

  // Нет токена
  else if (!localStorage.getItem('token')) next({ name: authRoute });

  // Есть токен и пользователь
  else if (store.state.main.user) next();

  else {
    // Получаем текущего пользоваеля по токену
    const { status, body: user } = await userService.value.GetCurrentUser();
    if (status === 200 && user) {
      store.commit('main/userSet', user);
      next();
    } else {
      next({ name: authRoute });
    }
  }
});

export default Router;
