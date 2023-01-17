<template>
  <div>
    <VisTimeline
      ref="timeline"
      :items="items"
      :groups="groups"
      :options="options"
      :events="['doubleClick']"
      @doubleClick="doubleClick"
    />
  </div>
</template>

<script setup>

import { ref, computed } from 'vue';
import dayjs from 'dayjs';

import VisTimeline from '@/components/TimelineComponent.vue';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

const props = defineProps(['data', 'users']);
const emit = defineEmits(['open']);

const items = computed(() => props.data.map((v) => ({
  id: v.internalId,
  group: v.sysNumberExecutor,
  className: v.state,
  start: v.createDateDate && dayjs(v.createDateDate).toDate(),
  end: (v.closeDateDate || v.endSlaDateDate)
    && dayjs(v.closeDateDate || v.endSlaDateDate).toDate(),
  content: `TL${v.internalId}`,
})));

const groups = computed(() => Array.from(props.users.values()).map((v) => ({
  id: v.systemNumber,
  content: v.fullName,
})));

function doubleClick(data) {
  if (data.item) emit('open', data.item);
}

const options = ref({
  locale: 'ru',
  editable: false,
  orientation: 'top',
  height: 400,
  verticalScroll: true,
  type: 'box',
  cluster: {
    titleTemplate: '{count} шт.',
  },
});

</script>

<style>

.vis-content .vis-background,
.vis-axis {
  display: none;
}

.vis-item.vis-cluster {
  background-color: #EEE;
  border-radius: 15px;
  min-width: 30px;
}

.vis-item { border: 0; }
.vis-item.pending_processing { background-color: #e67e22; }
.vis-item.in_processing { background-color: #e67e22; }
.vis-item.pending_execution { background-color: #e67e22; }
.vis-item.in_work { background-color: #27ae60; }
.vis-item.pending_clarification { background-color: #f1c40f; }
.vis-item.performed { background-color: lightgray; }
.vis-item.rejected { background-color: lightgray; }
.vis-item.closed { background-color: lightgray; }

</style>
