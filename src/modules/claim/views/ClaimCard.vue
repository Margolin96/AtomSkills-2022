<template>
  <Toast />

  <template v-if="data">
    <Card class="mx-4 mt-4">
      <template #title>
        <div class="text-900 text-3xl font-medium">
          Заявка {{ data.number }}

          <i
            v-if="sourcesMap.get(data.source)?.icon"
            :class="sourcesMap.get(data.source).icon"
            v-tooltip="sourcesMap.get(data.source).label"
          />
        </div>
      </template>
      <template #content>
        <div class="mb-5">
          <Form :form="form" @filter="onFilter" v-if="buttons.length" />
          <div class="mt-3">
            <Button
              v-for="(button, i) in buttons"
              :key="i"
              :label="button.label"
              :icon="button.icon || 'pi pi-arrow-right'"
              :class="[
                button.icon ? 'p-button-text' : 'p-button-outlined',
                button.class,
              ]"
              :iconPos="button.icon ? 'left' : 'right'"
              @click="onClick(button)"
            />
          </div>
        </div>

        <table>
          <tr>
            <td>Дата формирования заявки</td>
            <td>{{ data.createDate }}</td>
          </tr>

          <tr>
            <td>Тип заявки</td>
            <td>{{ data.typeName }}</td>
          </tr>

          <tr>
            <td>Текст заявки</td>
            <td>{{ data.text }}</td>
          </tr>
          <tr>
            <td>Место оказания услуги</td>
            <td>{{ data.placeOfService }}</td>
        </tr>
        <tr>
            <td>Приоритет</td>
            <td>{{ data.priorityName }}</td>
          </tr>
          <tr>
            <td>SLA</td>
            <td>{{ data.timeSla }}</td>
          </tr>
          <tr>
            <td>Время выполения согласно SLA</td>
            <td>
              {{ data.endSlaDate }}

              <span class="ml-2">
                <i
                  v-if="data.slaPassedIcon === 1"
                  v-tooltip="'SLA выполнено'"
                  class="pi pi-check"
                />
                <i
                  v-else-if="data.slaPassedIcon === -1"
                  v-tooltip="'SLA не выполнено'"
                  class="pi pi-times"
                />
              </span>
            </td>
          </tr>
          <tr>
            <td>Статус</td>
            <td>{{ data.stateName }}</td>
          </tr>
          <tr>
            <td>Дата изменения статуса</td>
            <td>{{ data.stateEditDate }}</td>
          </tr>
          <tr>
            <td>Комментарий исполнителя</td>
            <td>{{ data.comment }}</td>
          </tr>
          <tr>
            <td>Дата закрытия заявки</td>
            <td>{{ data.closeDate }}</td>
          </tr>
          <tr>
            <td>История</td>
            <td>
              <div v-for="(step, i) in data.steps" :key="i">
                <hr />
                <Tag severity="info" class="mr-2">
                  {{ statesMap.get(step.state)?.captionState }}
                </Tag>

                <small>
                  {{ step.dateStart && dayjs(step.dateStart).format('LL HH:mm') }}
                  {{ step.dateEnd && ` - ${dayjs(step.dateEnd).format('LL HH:mm')}` }}
                </small>

                <div class="my-3">{{ step.comment }}</div>

                <span>
                  {{ usersMap.get(step.systemNumber)?.fullName }}
                  <Tag>{{ usersMap.get(step.systemNumber)?.systemNumber }}</Tag>
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td>Инициатор</td>
            <td v-if="usersMap.get(data.sysNumberAuthor)">
              {{ usersMap.get(data.sysNumberAuthor).fullName }}
              <Tag>{{ usersMap.get(data.sysNumberAuthor).systemNumber }}</Tag>
            </td>
          </tr>
          <tr>
            <td>Исполнитель</td>
            <td>
              {{ usersMap.get(data.sysNumberExecutor)?.fullName }}
              <Tag v-if="usersMap.get(data.sysNumberExecutor)">
                {{ usersMap.get(data.sysNumberExecutor)?.systemNumber }}
              </Tag>
            </td>
          </tr>
        </table>
      </template>
    </Card>
  </template>
</template>

<script setup>

import dayjs from 'dayjs';
import { ref, computed } from 'vue';

import UserService from '@/api/UserService';
import ClaimService from '@/api/ClaimService';

import Button from 'primevue/button';
import Toast from 'primevue/toast';
import Tag from 'primevue/tag';
import Card from 'primevue/card';

import Form from '@/components/FormBuilder.vue';

import { useToast } from 'primevue/usetoast';
import { store } from '@/store';

import { useForm, Required } from '@/use/form';

const userService = ref(new UserService());
const claimService = ref(new ClaimService());

const props = defineProps(['data', 'enums', 'usersMap']);
const data = computed(() => props.data);
const enums = computed(() => props.enums);

const toast = useToast();

const currentUser = computed(() => store.state.main?.user);

const sourcesMap = ref(new Map([
  [1, { icon: 'pi pi-globe', label: 'Получено через интерфейс' }],
  [2, { icon: 'pi pi-envelope', label: 'Получено через почту' }],
]));
const statesMap = computed(() => enums.value.states?.reduce((acc, v) => acc
  .set(v.nameState, v), new Map()));

const filteredUsers = ref([]);

const form = ref({});

function onClick(button) {
  if (button.required?.length) {
    const invalid = button.required.some((key) => !form.value.value[key]);
    if (invalid || !form.value.valid) {
      toast.add({
        severity: 'error',
        summary: 'Заполните обязательные поля',
        life: 3000,
      });
      return;
    }
  }
  // const paramsMap = [...button.required, ...button.optional]
  //   .reduce((acc, v) => acc.set(v, data[v]), new Map());

  claimService.value[button.action]({ internalId: data.value.internalId, ...form.value.value })
    .then(({ status }) => {
      if (status !== 200) {
        toast.add({
          severity: 'error',
          summary: 'Не удалось передвинуть по ЖЦ',
          life: 3000,
        });
        return;
      }
      document.location.reload();
    });
}

const availableButtons = computed(() => [
  {
    label: 'В обработку',
    action: 'ToProcessing',
    required: ['type', 'priority', 'comment'],
    optional: [],
    visible: ['pending_processing'].includes(data.value.state)
      && ['admin', 'first_line_operator'].includes(currentUser.value?.role),
  },
  {
    label: 'К исполнению',
    action: 'ToExecution',
    required: ['sysNumberExecutor', 'comment'],
    optional: [],
    visible: (
      ['in_processing'].includes(data.value.state)
      && ['admin', 'first_line_operator'].includes(currentUser.value?.role)
    ) || (
      ['in_processing', 'pending_execution', 'in_work', 'pending_clarification'].includes(data.value.state)
      && ['service_manager'].includes(currentUser.value?.role)
    ),
  },
  {
    label: 'В работу',
    action: 'ToWork',
    required: ['comment'],
    optional: [],
    visible: ['pending_execution'].includes(data.value.state)
      && (
        ['admin'].includes(currentUser.value?.role)
        || data.value.sysNumberExecutor === currentUser.value?.systemNumber
      ),
  },
  {
    label: 'Вернуть в работу',
    action: 'ToWork',
    required: ['comment'],
    optional: [],
    visible: ['pending_clarification'].includes(data.value.state)
      && (
        ['admin'].includes(currentUser.value?.role)
        || data.value.sysNumberExecutor === currentUser.value?.systemNumber
      ),
  },
  {
    label: 'На уточнение',
    action: 'ToClarification',
    class: 'p-button-secondary',
    icon: 'pi pi-comment',
    required: ['comment'],
    optional: [],
    visible: ['in_work', 'pending_clarification'].includes(data.value.state)
      && (
        ['admin'].includes(currentUser.value.role)
        || data.value.sysNumberExecutor === currentUser.value?.systemNumber
      ),
  },
  {
    label: 'Отклонить',
    action: 'ToRejected',
    class: 'p-button-danger',
    icon: 'pi pi-ban',
    required: ['comment'],
    optional: [],
    visible: (
      !['rejected', 'performed', 'closed'].includes(data.value.state)
      && ['admin', 'first_line_operator'].includes(currentUser.value?.role)
    ) || (
      ['in_work', 'pending_clarification'].includes(data.value.state)
      && data.value.sysNumberExecutor === currentUser.value?.systemNumber
    ),
  },
  {
    label: 'Выполнено',
    action: 'ToPerformed',
    class: 'p-button-success',
    icon: 'pi pi-check',
    required: ['comment'],
    optional: [],
    visible: (
      !['rejected', 'performed', 'closed'].includes(data.value.state)
      && ['admin', 'first_line_operator'].includes(currentUser.value?.role)
    ) || (
      ['in_work', 'pending_clarification'].includes(data.value.state)
      && data.value.sysNumberExecutor === currentUser.value?.systemNumber
    ),
  },
]);

const buttons = computed(() => availableButtons.value.filter((v) => v.visible));

function findUsers(value) {
  userService.value.SearchUsers({ typeClaims: [data.value.type], query: value })
    .then(({ status, body }) => {
      if (status !== 200) return;
      filteredUsers.value = body.map((v) => ({
        ...v,
        label: [v.email, v.fullName].filter(Boolean).join(' - '),
      }));
    });
}

function onFilter({ event, field }) {
  if (field.key !== 'sysNumberExecutor') return;
  findUsers(event.value);
}

setTimeout(() => {
  findUsers();
  form.value = useForm([
    {
      value: props.data.type,
      key: 'type',
      label: 'Тип',
      type: 'select',
      validators: {},
      options: computed(() => enums.value.typeClaims),
      optionLabel: 'captionClaim',
      optionValue: 'nameClaim',
    },
    {
      value: props.data.priority,
      key: 'priority',
      label: 'Приоритет',
      type: 'select',
      validators: {},
      options: computed(() => enums.value.priorities),
      optionLabel: 'captionPriority',
      optionValue: 'namePriority',
    },
    {
      value: props.data.sysNumberExecutor,
      key: 'sysNumberExecutor',
      label: 'Исполнитель',
      type: 'select',
      validators: {},
      options: computed(() => filteredUsers.value),
      optionLabel: 'label',
      optionValue: 'systemNumber',
      filter: true,
    },
    { key: 'comment', label: 'Комментарий', type: 'textarea', validators: { Required } },
  ]);
}, 500);

</script>

<style>

table {
  border-collapse: collapse;
}
td {
  border: 1px solid #e5e5e5;
  padding: 10px;
}

dt {
  margin-top: 10px;
  font-weight: 500;
}
dt:first-child {
  margin-top: 0;
}
dd {
  margin-top: 10px;
}
dd + dd {
  padding-top: 10px;
  border-top: 1px solid #E5E5E5;
}

</style>
