import { ref } from 'vue'

export function useDebounce<T>(value: T, delay = 300) {
  const debouncedValue = ref(value) as { value: T }

  let timeout: ReturnType<typeof setTimeout>
  const setDebouncedValue = (newValue: T) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  }
  return [debouncedValue, setDebouncedValue] as const
}
