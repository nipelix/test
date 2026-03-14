/**
 * Feed container genişliğine göre kaç market kolonu gösterileceğini hesaplar.
 * Container ref'ini alır, ResizeObserver ile izler ve kolon sayısını provide eder.
 *
 * Breakpoints:
 *   < 480px  → 1 kolon
 *   480-639  → 2 kolon
 *   640-859  → 3 kolon
 *   >= 860   → 4 kolon
 */
export function useMarketColumns(containerRef: Ref<HTMLElement | null>) {
  const columns = ref(3)

  function calcColumns(width: number): number {
    if (width < 480) return 1
    if (width < 640) return 2
    if (width < 860) return 3
    return 4
  }

  let ro: ResizeObserver | null = null

  onMounted(() => {
    if (!containerRef.value) return
    columns.value = calcColumns(containerRef.value.clientWidth)

    ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cols = calcColumns(entry.contentRect.width)
        if (cols !== columns.value) columns.value = cols
      }
    })
    ro.observe(containerRef.value)
  })

  onBeforeUnmount(() => {
    ro?.disconnect()
  })

  // Tüm child EventCard'lar inject ile okuyacak
  provide('marketColumns', columns)

  return columns
}
