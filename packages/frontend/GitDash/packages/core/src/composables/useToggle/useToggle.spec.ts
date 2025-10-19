import { describe, it, expect } from 'vitest'
import { useToggle } from './useToggle'


describe('useToggle', () => {
  it('toggles false → true → false', () => {
    const { value, toggle } = useToggle(false)
    expect(value.value).toBe(false)
    toggle()
    expect(value.value).toBe(true)
    toggle()
    expect(value.value).toBe(false)
  })


  it('sets explicit boolean', () => {
    const { value, toggle } = useToggle(true)
    toggle(false)
    expect(value.value).toBe(false)
    toggle(true)
    expect(value.value).toBe(true)
  })
})
