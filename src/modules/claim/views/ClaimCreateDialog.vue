<template>
  <Dialog
    :visible="props.visible"
    header="Создание заявки"
    :modal="true"
    class="p-fluid w-full max-w-30rem"
  >
    <template v-if="timeSla">
      <b>Ожидаемое SLA:</b>
      {{ dayjs.duration({ minutes: timeSla }).humanize() }}
    </template>

    <Form :form="form" @input="onChange" />

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

import dayjs from 'dayjs';

import { ref } from 'vue';
import { useForm, Required } from '@/use/form';

import ClaimService from '@/api/ClaimService';

import Form from '@/components/FormBuilder.vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import BlockUI from 'primevue/blockui';

const props = defineProps({
  visible: Boolean,
  claimTypes: Array,
  priorities: Array,
  data: Object,
});

const claimService = ref(new ClaimService());
const timeSla = ref();
const loading = ref(false);

const emit = defineEmits(['hide', 'created']);

const form = useForm([
  {
    key: 'type',
    label: 'Тип',
    type: 'select',
    options: props.claimTypes,
    validators: { Required },
    optionLabel: 'captionClaim',
    optionValue: 'nameClaim',
  },
  {
    key: 'priority',
    label: 'Приоритет',
    type: 'select',
    options: props.priorities,
    validators: { Required },
    optionLabel: 'captionPriority',
    optionValue: 'namePriority',
  },
  { key: 'text', label: 'Текст', type: 'textarea', validators: { Required } },
  { key: 'placeOfService', label: 'Место', type: 'textarea', validators: {} },
].map((v) => ({ ...v, value: props.data[v.key] })));

function hide() {
  emit('hide');
}
async function save() {
  loading.value = true;

  await setTimeout(() => {}, 1000);

  claimService.value.CreateClaim(form.value.value)
    .then(({ status, body }) => {
      if (status === 200) {
        emit('created', body);
        hide();
      }
    });

  loading.value = false;
}

function onChange() {
  if (!form.value.value.priority || !form.value.value.type) {
    timeSla.value = null;
    return;
  }

  claimService.value.GetRemainingSlaTime({
    type: form.value.value.type,
    priority: form.value.value.priority,
  })
    .then(({ status, body }) => {
      if (status !== 200) return;
      timeSla.value = body;
    });
}

</script>
