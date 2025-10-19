import { ref } from 'vue'


export function useToggle(initial = false) {
  const value = ref<boolean>(initial)
  const toggle = (next?: boolean) => {
    value.value = typeof next === 'boolean' ? next : !value.value
  }
  return { value, toggle }
}
