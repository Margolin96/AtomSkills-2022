import ClaimListView from './views/ClaimListView.vue';
import ClaimCardView from './views/ClaimCardView.vue';

export default [
  {
    path: '/claims',
    name: 'claims',
    component: ClaimListView,
    meta: {
      inMenu: true,
      label: 'Заявки',
      icon: 'pi-lock',
    },
  },
  {
    path: '/claims/:claimId',
    name: 'claimCard',
    component: ClaimCardView,
    meta: {
      label: 'Карточка заявки',
      icon: 'pi-lock',
    },
  },
];
