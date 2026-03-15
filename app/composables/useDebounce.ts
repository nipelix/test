/**
 * Creates a debounced ref that updates after a delay.
 * Replaces manual setTimeout patterns across composables.
 */
export function refDebounced<T>(source: Ref<T>, delay: number = 300): Readonly<Ref<T>> {
  const debounced = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(source, (val) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = val
    }, delay)
  })

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })

  return readonly(debounced)
}
