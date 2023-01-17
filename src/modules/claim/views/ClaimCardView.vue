<template>
  <PageLayout>
    <template v-if="!!data">
      <ClaimCard :data="data" :enums="enums" :usersMap="usersMap" />
    </template>
  </PageLayout>
</template>

<script setup>

import { useRoute } from 'vue-router';
import { ref, computed } from 'vue';

import dayjs from 'dayjs';

import ClaimService from '@/api/ClaimService';
import UserService from '@/api/UserService';

import PageLayout from '@/components/PageLayout.vue';
import ClaimCard from './ClaimCard.vue';

const data = ref({});

const enums = ref({});
const route = useRoute();
const claimService = ref(new ClaimService());
const userService = ref(new UserService());

const slaStatesMap = ref(new Map([
  [-1, 'Не выполнено'],
  [0, ''],
  [1, 'Выполнено'],
]));
const usersMap = ref(new Map());
const prioritiesMap = computed(() => enums.value.priorities?.reduce((acc, v) => acc
  .set(v.namePriority, v), new Map()));
const statesMap = computed(() => enums.value.states?.reduce((acc, v) => acc
  .set(v.nameState, v), new Map()));
const typeClaimsMap = computed(() => enums.value.typeClaims?.reduce((acc, v) => acc
  .set(v.nameClaim, v), new Map()));

const getUser = (systemNumber) => {
  if (!systemNumber) return;
  if (usersMap.value.has(systemNumber)) return;

  userService.value.GetUser({ systemNumber })
    .then(({ status, body }) => {
      if (status !== 200) return;
      usersMap.value.set(systemNumber, body);
    });
};

claimService.value.GetEnums()
  .then(({ status, body }) => {
    if (status === 200) {
      enums.value = body;
    }
  });

claimService.value.GetClaimById({ claimId: route.params.claimId })
  .then(async ({ status, body: v }) => {
    if (status === 200) {
      let slaPassed = 0;

      if (['performed', 'rejected', 'closed'].includes(v.state)) {
        slaPassed = dayjs(v.closeDate).diff(dayjs(v.endSlaDate)) < 0 ? 1 : -1;
      }

      data.value = {
        ...v,
        stateName: computed(() => statesMap.value.get(v.state)?.captionState),
        priorityName: computed(() => prioritiesMap.value.get(v.priority)?.captionPriority),
        typeName: computed(() => typeClaimsMap.value.get(v.type)?.captionClaim),
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

      getUser(v.sysNumberAuthor);
      getUser(v.sysNumberExecutor);
      v.steps.forEach((s) => getUser(s.systemNumber));
    }
  });

</script>
