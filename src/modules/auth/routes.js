import LoginView from './views/LoginView.vue';
import SignupView from './views/SignupView.vue';
import LogoutView from './views/LogoutView.vue';

export default [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      label: 'Вход',
      icon: 'pi-lock',
    },
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignupView,
    props: true,
    meta: {
      label: 'Регистрация',
      icon: 'pi-user-plus',
    },
  },
  {
    path: '/logout',
    name: 'logout',
    component: LogoutView,
    meta: {
      inMenu: true,
      label: 'Выход',
      icon: 'pi-sign-out',
    },
  },
];
