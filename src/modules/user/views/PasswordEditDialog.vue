<template>
  <Dialog
    :visible="props.visible"
    header="Редактирование пароля"
    :modal="true"
    class="p-fluid w-full max-w-30rem"
  >
    Системный номер:
    <Tag>{{ props.data.systemNumber }}</Tag>

    <Form :form="form" />

    <template #footer>
      <div class="flex justify-content-end">
        <Button
          label="Отмена"
          icon="pi pi-times"
          class="p-button-text p-button-secondary"
          @click="hide()"
        />
        <BlockUI :blocked="!form.valid.value">
          <Button
            label="Сохранить"
            :loading="loading"
            icon="pi pi-user"
            class="m-0"
            @click="save()"
          />
        </BlockUI>
      </div>
    </template>
  </Dialog>
</template>

<script setup>

import { ref } from 'vue';
import { useForm, Required } from '@/use/form';

import UserService from '@/api/UserService';

import Form from '@/components/FormBuilder.vue';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/badge';
import Button from 'primevue/button';
import BlockUI from 'primevue/blockui';

const props = defineProps({
  visible: Boolean,
  data: Object,
});

const userService = ref(new UserService());
const loading = ref(false);

const emit = defineEmits(['hide']);

const form = useForm([
  { key: 'password', label: 'Пароль', type: 'password', validators: { Required } },
].map((v) => ({ ...v, value: props.data[v.key] })));

function hide() {
  emit('hide');
}
async function save() {
  loading.value = true;

  await userService.value.SetPassword({
    userSystemNumber: props.data.systemNumber,
    ...form.value.value,
  }).then(({ status }) => {
    if (status === 200) hide();
  });

  loading.value = false;
}

</script>
