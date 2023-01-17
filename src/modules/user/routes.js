import UserListView from './views/UserListView.vue';
// import ProfileView from './views/ProfileView.vue';

export default [
  {
    path: '/users',
    name: 'users',
    component: UserListView,
    meta: {
      onlyAuth: true,
      inMenu: true,
      label: 'Пользователи',
      icon: 'pi-lock',
    },
  },
  // {
  //   path: '/profile',
  //   name: 'profile',
  //   component: ProfileView,
  //   props: true,
  //   meta: {
  //     label: 'Профиль',
  //     icon: 'pi-user-plus',
  //   },
  // },
];
