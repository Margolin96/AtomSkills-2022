<template>
  <PageLayout>
    <DataTable
      :value="items"
      class="p-datatable-sm"
    >
      <Column :field="c.key" :header="c.name" v-for="c in columns" :key="c.key">
        <template #body="slotProps">
          <template v-if="c.key === 'typeClaims'">
            <span v-for="(v, i) in slotProps.data[c.key]" :key="i" class="pr-4">
              {{ typeClaimsMap.get(v)?.captionClaim }}
            </span>
          </template>

          <template v-else-if="c.key === 'role'">
            {{ rolesMap.get(slotProps.data[c.key])?.captionRole }}
          </template>

          <template v-else-if="c.key === 'email'">
            <Button
              v-if="!slotProps.data[c.key]"
              @click="edit(slotProps.data)"
              v-tooltip.right="'Email не установлен'"
              icon="pi pi-exclamation-triangle"
              class="p-button-text p-button-sm py-1 p-button-warning"
            />
            <a
              v-else
              :href="`mailto:${slotProps.data[c.key]}`"
              class="no-underline ml-2 text-blue-500"
            >
              {{ slotProps.data[c.key] }}
            </a>
          </template>

          <template v-else-if="c.key === 'hasPassword'">
            <template v-if="slotProps.data[c.key]">
              <Button
                @click="editPassword(slotProps.data)"
                v-tooltip.left="'Сменить пароль'"
                icon="pi pi-replay"
                class="p-button-text p-button-sm py-1"
              />
            </template>
            <template v-else>
              <Button
                @click="editPassword(slotProps.data)"
                v-tooltip.left="'Пароль не установлен'"
                icon="pi pi-exclamation-triangle"
                class="p-button-text p-button-sm py-1 p-button-warning"
              />
            </template>
          </template>

          <template v-else-if="c.key === 'controls'">
            <Button
              icon="pi pi-pencil"
              class="p-button-text p-button-sm py-1"
              @click="edit(slotProps.data)"
            />
          </template>

          <template v-else>
            {{ slotProps.data[c.key] }}
          </template>
        </template>
      </Column>
    </DataTable>

    <UserEditDialog
      v-if="!!userEditDialog"
      :visible="!!userEditDialog"
      :data="userEditDialog"
      :roles="roles"
      :claimTypes="claimTypes"
      @hide="userEditDialog = null"
    />

    <PasswordEditDialog
      v-if="!!passwordEditDialog"
      :visible="!!passwordEditDialog"
      :data="passwordEditDialog"
      @hide="passwordEditDialog = null"
    />
  </PageLayout>
</template>

<script setup>

/* System */
import { ref, computed } from 'vue';

/* API Services */
import UserService from '@/api/UserService';
import ClaimService from '@/api/ClaimService';

/* Components */
import PageLayout from '@/components/PageLayout.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

import UserEditDialog from './UserEditDialog.vue';
import PasswordEditDialog from './PasswordEditDialog.vue';

/* Variables */
const userService = ref(new UserService());
const claimService = ref(new ClaimService());
const columns = [
  { key: 'email', name: 'Email' },
  { key: 'name', name: 'Имя' },
  { key: 'surname', name: 'Фамилия' },
  { key: 'patronymic', name: 'Отчество' },
  { key: 'systemNumber', name: 'Системный номер' },
  { key: 'role', name: 'Роль' },
  { key: 'hasPassword', name: 'Пароль' },
  { key: 'typeClaims', name: 'Типы заявок' },
  { key: 'controls' },
];
const items = ref([]);
const roles = ref([]);
const claimTypes = ref([]);
const userEditDialog = ref(null);
const passwordEditDialog = ref(null);

/* Computed */
const rolesMap = computed(() => roles.value.reduce((acc, v) => acc
  .set(v.nameRole, v), new Map()));
const typeClaimsMap = computed(() => claimTypes.value.reduce((acc, v) => acc
  .set(v.nameClaim, v), new Map()));

/* Logic */

// Список пользователей
userService.value.GetAllUsers()
  .then((data) => {
    items.value = data.body;
  });

// Роли пользователей
userService.value.GetAllRoles()
  .then((data) => {
    roles.value = data.body;
  });

// Типы заявок
claimService.value.GetEnums()
  .then((data) => {
    claimTypes.value = data.body.typeClaims;
  });

function edit(data) {
  userEditDialog.value = data;
}

function editPassword(data) {
  passwordEditDialog.value = data;
}

</script>
