<template>
  <PageLayout>
    <Toast />

    <ClaimCreateDialog
      v-if="!!claimCreateDialog"
      :visible="claimCreateDialog && enums && true"
      :data="claimCreateDialog"
      :priorities="enums.priorities"
      :claimTypes="enums.typeClaims"
      @hide="claimCreateDialog = null"
      @created="onClaimCreated"
    />

    <template #right>
      <Button
        v-if="view !== 'gantt'"
        label="Показать Ганта"
        icon="pi pi-plus"
        class="m-0"
        @click="view = 'gantt'"
      />
      <Button
        v-if="view !== 'table'"
        label="Скрыть Ганта"
        icon="pi pi-plus"
        class="m-0"
        @click="view = 'table'"
      />

      <Button
        v-if="!!currentUser?.email"
        label="Создать"
        :loading="loading"
        icon="pi pi-plus"
        class="m-0"
        @click="create()"
      />
    </template>

    <GanttView :data="items" :users="usersMap" v-if="view === 'gantt'" @open="openCard" />

    <DataTable
      :value="items"
      class="p-datatable-sm"
      removableSort
      v-model:filters="filters"
      filterDisplay="menu"
      :loading="loading"
      :lazy="true"
      ref="datatable"
      @sort="onSort($event)"
      @filter="onFilter($event)"
    >
      <template #header>
        <Button
          class="p-button-text"
          icon="pi pi-file-excel"
          label="CSV"
          @click="exportCSV($event)"
        />

        <Button
          class="p-button-text"
          icon="pi pi-code"
          label="JSON"
          @click="exportJSON($event)"
        />

        <Button
          class="p-button-text"
          icon="pi pi-print"
          label="Печать"
          @click="exportPrint($event)"
        />
      </template>
      <template #empty>
        Нет доступных заявок
      </template>
      <template #loading>
        Загрузка...
      </template>

      <Column
        :sortable="columnsToSort.has(c.key)"
        :field="c.key" :header="c.name" v-for="c in columns"
        :key="c.key"
        :filterField="c.key"
        :showFilterMatchModes="false"
        :exportable="columnsToExport.has(c.key)"
        :hidden="c.hidden"
      >
        <template #filter="{ filterModel }" v-if="c.key in filters">
          <MultiSelect
            v-if="filters[c.key].type === 'select'"
            :options="filters[c.key].options"
            :optionValue="filters[c.key].optionValue"
            :optionLabel="filters[c.key].optionLabel"
            :placeholder="filters[c.key].placeholder"
            v-model="filterModel.value"
          />
          <Calendar
            v-else-if="filters[c.key].type === 'date-range'"
            v-model="filterModel.value"
            selectionMode="range"
          />
          <template v-else-if="filters[c.key].type === 'number'">
            <span v-if="filterModel.value && filterModel.value.length">
              {{ filterModel.value }}
            </span>
            <Slider
              v-model="filterModel.value"
              :min="filters[c.key].min"
              :max="filters[c.key].max"
              :step="1"
              :range="true"
            />
          </template>
          <InputText
            v-else
            type="text"
            v-model="filterModel.value"
            class="p-column-filter"
            :placeholder="`Search by name - `"
            v-tooltip.top.focus="'Hit enter key to filter'"
          />
        </template>

        <template #body="slotProps">
          <template v-if="c.key === 'controls'">
            <Button
              @click="openCard(slotProps.data.internalId)"
              v-tooltip="'Открыть заявку'"
              icon="pi pi-external-link"
              class="p-button-text p-button-sm py-1"
            />
          </template>

          <template v-else-if="c.type === 'map'">
            {{ maps[c.map].get(slotProps.data[c.key])?.[c.label] || slotProps.data[c.key] }}
          </template>

          <template v-else-if="c.type === 'map-icon'">
            <i
              v-if="maps[c.map].get(slotProps.data[c.key])"
              :class="maps[c.map].get(slotProps.data[c.key]).icon"
              v-tooltip="maps[c.map].get(slotProps.data[c.key]).label"
            />
          </template>

          <template v-else-if="c.type === 'boolean'">
            <i
              v-if="slotProps.data[c.key] === 1"
              v-tooltip="'SLA выполнено'"
              class="pi pi-check"
            />
            <i
              v-else-if="slotProps.data[c.key] === -1"
              v-tooltip="'SLA не выполнено'"
              class="pi pi-times"
            />
          </template>

          <template v-else>
            {{ slotProps.data[c.key] }}
          </template>
        </template>
      </Column>
    </DataTable>
  </PageLayout>
</template>

<script setup>

import GanttView from '@/components/GanttView.vue';

/* System */
import { useRouter } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import { store } from '@/store';
import dayjs from 'dayjs';
import { useToast } from 'primevue/usetoast';

/* API Services */
import ClaimService from '@/api/ClaimService';
import UserService from '@/api/UserService';

/* Components */
import PageLayout from '@/components/PageLayout.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import MultiSelect from 'primevue/multiselect';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Slider from 'primevue/slider';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import ClaimCreateDialog from './ClaimCreateDialog.vue';

/* Variables */
const toast = useToast();
const router = useRouter();
const claimCreateDialog = ref(null);
const datatable = ref();
const claimService = ref(new ClaimService());
const userService = ref(new UserService());
const loading = ref(false);
const sort = ref({});
const curFilters = ref({});
const view = ref('table');
const items = ref([]);
const enums = ref({
  priorities: [],
  states: [],
  typeClaims: [],
});

const currentUser = computed(() => store.state.main?.user);

/* Maps */
const slaStatesMap = ref(new Map([
  [-1, 'Не выполнено'],
  [0, ''],
  [1, 'Выполнено'],
]));
const sourcesMap = ref(new Map([
  [1, { icon: 'pi pi-globe', label: 'Получено через интерфейс' }],
  [2, { icon: 'pi pi-envelope', label: 'Получено через почту' }],
]));
const usersMap = ref(new Map());
const prioritiesMap = computed(() => enums.value.priorities.reduce((acc, v) => acc
  .set(v.namePriority, v), new Map()));
const statesMap = computed(() => enums.value.states.reduce((acc, v) => acc
  .set(v.nameState, v), new Map()));
const typeClaimsMap = computed(() => enums.value.typeClaims.reduce((acc, v) => acc
  .set(v.nameClaim, v), new Map()));
const maps = computed(() => ({
  sources: sourcesMap.value,
  users: usersMap.value,
  priorities: prioritiesMap.value,
  states: statesMap.value,
  typeClaims: typeClaimsMap.value,
}));

const filters = ref({
  // internalId: { value: null, operator: FilterOperator.CONTAINS },
  state: {
    value: null,
    matchMode: FilterMatchMode.EQUALS,
    field: 'states',
    type: 'select',
    options: computed(() => enums.value.states),
    optionLabel: 'captionState',
    optionValue: 'nameState',
  },
  priority: {
    value: null,
    operator: FilterOperator.CONTAINS,
    field: 'priorities',
    type: 'select',
    options: computed(() => enums.value.priorities),
    optionLabel: 'captionPriority',
    optionValue: 'namePriority',
  },
  type: {
    value: null,
    operator: FilterOperator.CONTAINS,
    field: 'types',
    type: 'select',
    options: computed(() => enums.value.typeClaims),
    optionLabel: 'captionClaim',
    optionValue: 'nameClaim',
  },
  createDate: {
    value: null,
    operator: FilterOperator.CONTAINS,
    type: 'date-range',
  },
  closeDate: {
    value: null,
    operator: FilterOperator.CONTAINS,
    type: 'date-range',
  },
  timeSla: {
    value: [],
    operator: FilterOperator.CONTAINS,
    type: 'number',
    min: 0,
    max: 100,
    label: 'мин.',
  },
  // slaPassed: { value: null, operator: FilterOperator.CONTAINS },
  sysNumberAuthor: {
    value: null,
    operator: FilterOperator.CONTAINS,
    options: computed(() => Array.from(usersMap.value.values())),
    optionLabel: 'captionClaim',
    optionValue: 'nameClaim',
  },
  sysNumberExecutor: { value: null, operator: FilterOperator.CONTAINS },
  slaEndDate: {
    value: null,
    operator: FilterOperator.CONTAINS,
    type: 'date-range',
  },
});

const columnsToSort = ref(new Set([
  'state',
  'sysNumberExecutor',
  'timeSla',
  'priority',
  'createDate',
  'closeDate',
  'stateEditDate',
  'slaEndDate',
]));
const columnsToExport = ref(new Set([
  'number',
  'createDate',
  'closeDate',
  'typeName',
  'priorityName',
  'timeSla',
  'slaPassed',
  'author',
  'executor',
]));

const columns = ref([
  { key: 'source', name: '', type: 'map-icon', map: 'sources', label: 'label' },
  { key: 'number', name: 'Номер заявки' },
  { key: 'createDate', name: 'Дата формирования заявки', type: '_date' },
  { key: 'type', name: 'Тип заявки', type: 'map', map: 'typeClaims', label: 'captionClaim' },
  { key: 'typeName', name: 'Тип заявки', type: '_map', map: 'typeClaims', label: 'captionClaim', hidden: true },
  { key: 'text', name: 'Текст заявки' },
  { key: 'placeOfService', name: 'Место оказания услуги' },
  { key: 'priority', name: 'Приоритет', type: 'map', map: 'priorities', label: 'captionPriority' },
  { key: 'priorityName', name: 'Приоритет', type: '_map', map: 'priorities', label: 'captionPriority', hidden: true },
  { key: 'timeSla', name: 'SLA', type: '_duration', units: 'minutes' },
  { key: 'slaPassedIcon', name: 'Выполнение SLA', type: 'boolean' },
  { key: 'slaPassed', name: 'Выполнение SLA', type: 'boolean', hidden: true },
  { key: 'endSlaDate', name: 'Время выполения согласно SLA', type: 'date' },
  { key: 'state', name: 'Статус', type: 'map', map: 'states', label: 'captionState' },
  { key: 'stateName', name: 'Статус', type: '_map', map: 'states', label: 'captionState', hidden: true },
  { key: 'stateEditDate', name: 'Дата изменения статуса', type: '_date' },
  { key: 'comment', name: 'Комментарий исполнителя' },
  { key: 'closeDate', name: 'Дата закрытия заявки', type: '_date' },
  // { key: 'steps', name: 'История исполнителей' }, // ???
  { key: 'author', name: 'Инициатор', type: '_map', map: 'users', label: 'fullName' },
  { key: 'executor', name: 'Исполнитель', type: '_map', map: 'users', label: 'fullName' },
  { key: 'controls' },
]);

/* Logic */

// Список заявок
async function GetClaimList() {
  loading.value = true;

  await claimService.value.GetClaimList({ ...curFilters.value, ...sort.value })
    .then((data) => {
      items.value = data.body.map((v) => {
        let slaPassed = 0;

        if (['performed', 'rejected', 'closed'].includes(v.state)) {
          slaPassed = dayjs(v.closeDate).diff(dayjs(v.endSlaDate)) < 0 ? 1 : -1;
        }

        if (v.sysNumberExecutor && !usersMap.value.has(v.sysNumberExecutor)) {
          userService.value.GetUser({ systemNumber: v.sysNumberExecutor })
            .then(({ status, body }) => {
              if (status !== 200) return;
              usersMap.value.set(v.sysNumberExecutor, body);
            });
        }
        if (v.sysNumberAuthor && !usersMap.value.has(v.sysNumberAuthor)) {
          userService.value.GetUser({ systemNumber: v.sysNumberAuthor })
            .then(({ status, body }) => {
              if (status !== 200) return;
              usersMap.value.set(v.sysNumberAuthor, body);
            });
        }

        return {
          ...v,
          stateName: computed(() => statesMap.value.get(v.state)?.captionState),
          priorityName: computed(() => prioritiesMap.value.get(v.priority)?.captionPriority),
          typeName: computed(() => typeClaimsMap.value.get(v.type)?.captionClaim),
          createDateDate: v.createDate,
          closeDateDate: v.closeDate,
          endSlaDateDate: v.endSlaDate,
          createDate: v.createDate && dayjs(v.createDate).format('LL HH:mm'),
          closeDate: v.closeDate && dayjs(v.closeDate).format('LL HH:mm'),
          stateEditDate: v.stateEditDate && dayjs(v.stateEditDate).format('LL HH:mm'),
          endSlaDate: v.endSlaDate && dayjs(v.endSlaDate).format('LL HH:mm'),
          number: `TL${v.internalId}`,
          author: computed(() => usersMap.value.get(v.sysNumberAuthor)?.fullName),
          executor: computed(() => usersMap.value.get(v.sysNumberExecutor)?.fullName),
          timeSla: v.timeSla && dayjs.duration({ minutes: v.timeSla }).humanize(),
          slaPassedIcon: slaPassed,
          slaPassed: slaStatesMap.value.get(slaPassed),
        };
      });
    });

  loading.value = false;
}

// const PAST = (() => { const date = new Date(); date.setFullYear(1000); return date; })();
const FUTURE = (() => { const date = new Date(); date.setFullYear(3000); return date; })();

// Enums
claimService.value.GetEnums()
  .then((data) => {
    enums.value = data.body;
  });

function onSort(data) {
  sort.value = {
    sortBy: data.sortField || null,
    descending: data.sortOrder === -1,
  };
  GetClaimList();
}
function onFilter(data) {
  const filtersMap = Object.entries(data.filters)
    .reduce((acc, [key, filter]) => {
      const filterParsed = JSON.parse(JSON.stringify(filter));
      let { value } = filterParsed;
      const { type } = filterParsed;

      if (Array.isArray(value) && !value.length) {
        value = null;
      }

      if (type === 'date-range' && value) {
        value = {
          since: value[0],
          until: value[1] || FUTURE,
        };
      }

      if (type === 'number' && value) {
        value = {
          remainingSlaTimeFrom: value[0],
          remainingSlaTimeTo: value[1],
        };
      }

      return acc.set(filter.field || key, value);
    }, new Map());

  curFilters.value = Object.fromEntries(filtersMap);
  GetClaimList();
}

const exportCSV = () => datatable.value.exportCSV();
const exportJSON = () => {
  const data = datatable.value.value;
  const toExport = [];

  data.forEach((row) => {
    const exportRow = {};

    columnsToExport.value.forEach((key) => {
      exportRow[key] = row[key];
    });

    toExport.push(exportRow);
  });

  const link = document.createElement('a');
  link.setAttribute('href', `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(toExport))}`);
  link.setAttribute('download', 'scene.json');
  link.click();
  link.remove();
};
const exportPrint = () => window.print();

const openCard = (id) => {
  const route = router.resolve({ name: 'claimCard', params: { claimId: id } });
  window.open(route.href, '_blank');
};

const create = (data = {}) => {
  claimCreateDialog.value = data;
};

const onClaimCreated = (data) => {
  const { internalId, type, timeSla } = data;
  toast.add({
    severity: 'success',
    summary: `Заявка №TL${internalId} создана`,
    detail: `Тип: ${typeClaimsMap.value.get(type)?.captionClaim}. Время SLA: ${timeSla && dayjs.duration({ minutes: timeSla }).humanize()}`,
    life: 3000,
  });
  GetClaimList();
};

onMounted(() => {
  GetClaimList();
});

</script>

<style>

@media print {
  @page { size: landscape; }

  html {
    font-size: 9px !important;
  }

  body {
    padding: 0;
    margin: 0;
    background-color: #FFF;
  }
  .p-scrollpanel-content {
    padding: 0;
  }
  [role="cell"]:first-child { display: none; }
  .p-datatable.p-datatable-sm .p-datatable-tbody > tr > td {
    padding: 0;
  }
  .page-header *, #sidebar, .p-datatable-header, .p-column-filter, .p-paginator, .vis-timeline {
    display: none !important;
  }
}

.p-datatable-wrapper {
  overflow: auto;
}

</style>
