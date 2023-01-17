<template>
  <Card class="m-auto p-4 w-full max-w-30rem" v-if="!needAdmin">
    <template #title>
      <div class="text-center">
        <div class="text-900 text-3xl font-medium mb-3">Вход</div>
      </div>
    </template>

    <template #subtitle>
      <div class="text-center">
        <span class="text-600 font-medium line-height-3">Нет аккаунта?</span>
        <router-link class="font-medium no-underline ml-2 text-blue-500" :to="'/signup'">
          Зарегистрироваться
        </router-link>
      </div>
    </template>

    <template #content>
      <Form :form="form" />
    </template>

    <template #footer>
      <BlockUI :blocked="!form.valid.value">
        <Button
          label="Войти"
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
import { useRouter } from 'vue-router';
import { useForm, Required } from '@/use/form';

import Form from '@/components/FormBuilder.vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import BlockUI from 'primevue/blockui';

import UserService from '@/api/UserService';

const router = useRouter();

const userService = ref(new UserService());

/* Проверка наличия администратора в системе */
const needAdmin = !(await userService.value.CheckAdmin());
if (needAdmin) {
  router.push({ name: 'signup' });
}

/* Инициализация полей формы */
const form = useForm([
  { key: 'systemNumber', label: 'Системный номер', type: 'text', validators: { Required } },
  { key: 'password', label: 'Пароль', type: 'password', validators: { Required } },
]);

const error = ref(null);
const loading = ref(false);

async function submit() {
  loading.value = true;
  error.value = null;

  const { isError, statusText } = await userService.value.Login(form.value.value);

  error.value = isError ? statusText : null;
  loading.value = false;

  if (!isError) {
    router.push({ name: 'claims' });
  }
}

</script>
