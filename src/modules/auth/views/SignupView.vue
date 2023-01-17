<template>
  <Card class="m-auto p-4 w-full max-w-30rem">
    <template #title>
      <div class="text-center">
        <div class="text-900 text-3xl font-medium mb-3">Регистрация</div>
      </div>
    </template>

    <template #subtitle>
      <div class="text-center" v-if="!needAdmin">
        <span class="text-600 font-medium line-height-3">Есть аккаунт?</span>
        <router-link class="font-medium no-underline ml-2 text-blue-500" :to="'/login'">
          Войти
        </router-link>
      </div>

      <div class="text-center" v-else>
        <span class="text-600 font-medium line-height-3">Пользователь будет администратором</span>
      </div>
    </template>

    <template #content>
      <Form :form="form" />
    </template>

    <template #footer>
      <BlockUI :blocked="!form.valid.value">
        <Button
          label="Зарегистрироваться"
          :loading="loading"
          icon="pi pi-user"
          class="w-full"
          @click="submit()"
        />
      </BlockUI>

      <div v-if="error" class="p-error mt-3 font-medium">Произошла ошибка - {{ error }}</div>
    </template>
  </Card>
</template>

<script setup>

import { ref } from 'vue';
import { useForm, Required } from '@/use/form';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

import Card from 'primevue/card';
import Form from '@/components/FormBuilder.vue';
import Button from 'primevue/button';
import BlockUI from 'primevue/blockui';

import UserService from '@/api/UserService';

const userService = ref(new UserService());

const store = useStore();
const router = useRouter();

/* Проверка наличия администратора в системе */
const needAdmin = !(await userService.value.CheckAdmin());
const isAdmin = false;

const form = useForm([
  { key: 'email', label: 'Email', type: 'email', validators: { Required } },
  {
    key: 'name', label: 'Имя', type: 'text', validators: { Required },
  },
  {
    key: 'surname', label: 'Фамилия', type: 'text', validators: {},
  },
  {
    key: 'patronymic', label: 'Отчество', type: 'text', validators: {},
  },
  ...(!isAdmin
    ? []
    : [{
      key: 'role',
      label: 'Роль',
      type: 'select',
      options: await userService.value.GetAllRoles(),
      optionLabel: 'captionRole',
      optionValue: 'nameRole',
      validators: { Required },
    }]
  ),
  {
    key: 'password', label: 'Пароль', type: 'password', validators: { Required },
  },
]);

const error = ref(null);
const loading = ref(false);

async function submit() {
  // form.value.touched = true;
  loading.value = true;
  error.value = null;

  const { isError, statusText, body } = await userService.value.Create(form.value.value);

  error.value = isError ? statusText : null;
  loading.value = false;

  if (!isError) {
    store.commit('main/userSet', body);
    await userService.value.Login({ ...form.value.value, ...body });
    router.push({ name: 'claims' });
  }
}

</script>
