<template>
  <div class="flex flex-column w-full">
    <Toast />

    <Menubar :model="menu.items" id="sidebar">
      <template #end>
        <Button
          v-if="!!currentUser?._isAdmin"
          label="Синхронизация"
          :loading="loading"
          icon="pi pi-refresh"
          class="mr-3"
          @click="sync()"
        />
      </template>
    </Menubar>

    <div class="px-4 flex justify-content-between align-items-center page-header">
      <h1 class="my-3">{{ this.$route.meta.label }}</h1>
      <slot name="right" />
    </div>

    <ScrollPanel>
      <div class="page-layout">
        <slot />
      </div>
    </ScrollPanel>
  </div>
</template>

<script>

import Menubar from 'primevue/menubar';
import ScrollPanel from 'primevue/scrollpanel';
import SyncService from '@/api/SyncService';

import Button from 'primevue/button';
import Toast from 'primevue/toast';

import { store } from '@/store';

export default {
  name: 'PageLayout',
  components: {
    Menubar,
    ScrollPanel,
    Button,
    Toast,
  },
  computed: {
    currentUser() { return store.state.main?.user; },
  },
  data: () => ({
    menu: {
      items: [],
    },
    loading: false,
    syncService: new SyncService(),
  }),
  created() {
    this.menu.items = this.$router.options.routes.filter((v) => v.meta?.inMenu).map((v) => ({
      label: v.meta?.label,
      icon: `pi pi-fw ${v.meta?.icon}`,
      to: v.path,
    }));
  },
  methods: {
    sync() {
      this.loading = true;
      this.syncService.Synchronize().then(({ status }) => {
        this.loading = false;
        if (status !== 200) {
          this.$toast.add({ severity: 'error', summary: 'Не удалось выполнить синхронизацию', life: 3000 });
          return;
        }
        document.location.reload();
      });
    },
  },
};

</script>

<style>

#page {
  width: 100%;
}

.p-scrollpanel {
  overflow: hidden;
  width: 100%;
}

.p-tieredmenu .p-menuitem-link:focus {
  box-shadow: unset !important;
}

</style>
