export function useFormValidation<T extends Record<string, any>>(
  validators: () => Record<keyof T, string | undefined>
) {
  const submitted = ref(false)
  const touched = reactive<Record<string, boolean>>({})

  const errors = computed(validators)

  const visibleErrors = computed(() => {
    const result: Record<string, string | undefined> = {}
    for (const key of Object.keys(errors.value)) {
      result[key] = (submitted.value || touched[key as string]) ? errors.value[key as keyof T] : undefined
    }
    return result
  })

  const hasErrors = computed(() => {
    return Object.values(errors.value).some(e => !!e)
  })

  function touch(field: string) {
    touched[field] = true
  }

  function reset() {
    submitted.value = false
    for (const key of Object.keys(touched)) {
      delete touched[key]
    }
  }

  function submit() {
    submitted.value = true
    return !hasErrors.value
  }

  return {
    errors,
    visibleErrors,
    hasErrors,
    submitted,
    touched,
    touch,
    reset,
    submit
  }
}
