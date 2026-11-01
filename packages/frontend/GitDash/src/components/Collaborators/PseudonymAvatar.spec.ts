import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PseudonymAvatar from './PseudonymAvatar.vue'
import { PSEUDONYM_AVATAR_SRC } from './pseudonymAvatar'

describe('PseudonymAvatar.vue', () => {
  it('uses a locally drawn image, never a remote URL', () => {
    expect(PSEUDONYM_AVATAR_SRC.startsWith('data:image/svg+xml')).toBe(true)
    expect(decodeURIComponent(PSEUDONYM_AVATAR_SRC)).toContain('<svg')

    const wrapper = mount(PseudonymAvatar)
    expect(wrapper.findComponent({ name: 'VImg' }).props('src')).toBe(PSEUDONYM_AVATAR_SRC)
  })
})
