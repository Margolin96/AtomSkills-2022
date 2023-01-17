import { ref, reactive, watch } from 'vue';

const not = (val) => !val;

export function useField(field) {
  const valid = ref(true);
  const value = ref(field.value);
  const touched = ref(false);
  const errors = reactive({});

  const reassign = (val) => {
    valid.value = true;
    Object.keys(field.validators ?? {}).forEach((name) => {
      const isValid = field.validators[name](val);
      errors[name] = not(isValid);
      if (not(isValid)) {
        valid.value = false;
      }
    });
  };

  watch(value, reassign);
  reassign(field.value);

  return {
    ...field,
    value,
    valid,
    errors,
    touched,
    blur: () => { touched.value = true; },
  };
}

export default useField;
