<template>
  <Dialog
    :visible="props.visible"
    header="Редактирование пользователя"
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
  roles: Array,
  claimTypes: Array,
});

const userService = ref(new UserService());

const loading = ref(false);

const emit = defineEmits(['hide']);

const form = useForm([
  { key: 'email', label: 'Email', type: 'email', validators: { Required } },
  { key: 'name', label: 'Имя', type: 'text', validators: { Required } },
  { key: 'surname', label: 'Фамилия', type: 'text', validators: {} },
  { key: 'patronymic', label: 'Отчество', type: 'text', validators: {} },
  {
    key: 'role',
    label: 'Роль',
    type: 'select',
    options: props.roles,
    validators: { Required },
    optionLabel: 'captionRole',
    optionValue: 'nameRole',
  },
  {
    key: 'typeClaims',
    label: 'Типы заявок',
    type: 'multiple-select',
    options: props.claimTypes,
    validators: { Required },
    optionLabel: 'captionClaim',
    optionValue: 'nameClaim',
  },
].map((v) => ({ ...v, value: props.data[v.key] })));

function hide() {
  emit('hide');
}
async function save() {
  loading.value = true;

  await setTimeout(() => {}, 1000);

  userService.value.Update({
    systemNumber: props.data.systemNumber,
    ...form.value.value,
  })
    .then(({ status }) => {
      if (status === 200) {
        hide();
        window.location.reload();
      }
    });

  loading.value = false;
}

</script>
