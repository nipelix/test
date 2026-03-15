import { ref, watch, readonly as vueReadonly, onBeforeUnmount } from 'vue'
import type { Ref, DeepReadonly } from 'vue'

/**
 * Creates a debounced ref that updates after a delay.
 */
export function refDebounced<T>(source: Ref<T>, delay: number = 300): DeepReadonly<Ref<T>> {
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

  return vueReadonly(debounced) as DeepReadonly<Ref<T>>
}
