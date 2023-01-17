<template>
  <template v-for="(field, index) in props.form.fields" :key="index">
    <label :for="field.key" class="block text-900 font-medium mt-3 mb-2">
      {{ field.label }}
      <span v-if="'Required' in field.validators">*</span>
    </label>

    <InputText
      v-if="['text', 'password', 'email'].includes(field.type)"
      :id="field.key"
      :type="field.type"
      :placeholder="field.placeholder"
      :class="{
        'w-full': true,
        'p-invalid': form.touched && !field.valid,
      }"
      v-model="field.value"
      @change="emit('input', field)"
    />

    <Textarea
      v-if="['textarea'].includes(field.type)"
      :id="field.key"
      :type="field.type"
      :placeholder="field.placeholder"
      :class="{
        'w-full': true,
        'p-invalid': form.touched && !field.valid,
      }"
      v-model="field.value"
      @change="emit('input', field)"
    />

    <Dropdown
      v-if="['select'].includes(field.type)"
      :id="field.key"
      :options="field.options"
      :optionValue="field.optionValue"
      :optionLabel="field.optionLabel"
      :placeholder="field.placeholder"
      :filter="!!field.filter"
      :class="{
        'w-full': true,
        'p-invalid': form.touched && !field.valid,
      }"
      v-model="field.value"
      @change="emit('input', field)"
      @filter="emit('filter', { event: $event, field })"
    />

    <MultiSelect
      v-if="['multiple-select'].includes(field.type)"
      :options="field.options"
      :optionValue="field.optionValue"
      :optionLabel="field.optionLabel"
      :placeholder="field.placeholder"
      :class="{
        'w-full': true,
        'p-invalid': form.touched && !field.valid,
      }"
      display="chip"
      v-model="field.value"
      @change="emit('input', field)"
    />

    <small
      v-if="form.touched && !field.valid && field.validators.find(v => v.name === 'Required')"
      class="p-error"
    >Обязательное поле</small>
  </template>
</template>

<script setup>

import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';

const props = defineProps(['form']);
const emit = defineEmits(['input', 'filter']);

</script>

<style>

.p-multiselect-label {
  white-space: normal;
}

.p-multiselect-token {
  margin-top: 3px;
}

</style>
