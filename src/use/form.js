import { computed, reactive } from 'vue';
import { useField } from './field';

export function useForm(fields = {}) {
  const form = {
    value: reactive({}),
    fields: reactive([]),
  };
  const validKey = 'valid';

  fields.forEach((field) => {
    if (!field) return;
    form.fields.push(useField(field));
  });

  form[validKey] = computed(() => !form.fields.some((f) => !f[validKey]));
  form.value = computed(() => Object.fromEntries(
    form.fields.reduce((acc, f) => acc.set(f.key, f.value), new Map()),
  ));

  return form;
}

export const Required = (v) => !!v && v !== 0;

export default useForm;
