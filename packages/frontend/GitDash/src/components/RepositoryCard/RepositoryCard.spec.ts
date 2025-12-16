import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RepositoryCard from './RepositoryCard.vue'

// Mock interface locally to avoid import issues
const mockRepo = {
  id: 123,
  fullName: 'organization/awesome-project',
  description: 'A very useful tool.',
  isPrivate: false,
  url: 'http://github.com',
  sshUrl: '',
  cloneUrl: '',
  htmlUrl: '',
  starred: 42,
  forked: 10,
  watchers: 5,
  languages: ['TypeScript', 'Vue'],
  owner: { login: 'organization', avatarUrl: '' },
  createdAt: '',
  updatedAt: ''
}

describe('RepositoryCard.vue', () => {
  const mountComponent = (props: any = {}) => {
    return mount(RepositoryCard, {
      props: {
        repo: mockRepo,
        ...props
      },
      global: {
        stubs: {
          // FIX: Added 'name' property to BaseCard so findComponent works
          BaseCard: {
            name: 'BaseCard',
            template: '<div class="base-card" @click="$emit(\'click\')"><slot /></div>',
            props: ['ripple', 'elevation']
          },
          // FIX: Added 'name' property to v-chip
          'v-chip': {
            name: 'v-chip',
            template: '<span class="v-chip"><slot /></span>',
            props: ['color']
          },
          // FIX: Added 'name' property to v-icon
          'v-icon': {
            name: 'v-icon',
            template: '<span><slot /></span>'
          },
          'v-avatar': true,
          'v-img': true,
        }
      }
    })
  }

  it('renders repository details correctly', () => {
    const wrapper = mountComponent()

    expect(wrapper.text()).toContain('organization/awesome-project')
    expect(wrapper.text()).toContain('A very useful tool.')
    expect(wrapper.text()).toContain('TypeScript')
    expect(wrapper.text()).toContain('Vue')

    // Stats
    expect(wrapper.text()).toContain('42') // stars
    expect(wrapper.text()).toContain('10') // forks
  })

  it('displays correct Public status style', () => {
    const wrapper = mountComponent({ repo: { ...mockRepo, isPrivate: false } })

    // Find first chip (Status chip) - now works because stub has name
    const chip = wrapper.findAllComponents({ name: 'v-chip' })[0]

    expect(chip.text()).toContain('Public')
    expect(chip.props('color')).toBe('blue-darken-2')
    expect(chip.html()).toContain('mdi-earth')
  })

  it('displays correct Private status style', () => {
    const wrapper = mountComponent({ repo: { ...mockRepo, isPrivate: true } })

    const chip = wrapper.findAllComponents({ name: 'v-chip' })[0]

    expect(chip.text()).toContain('Private')
    expect(chip.props('color')).toBe('black')
    expect(chip.html()).toContain('mdi-lock')
  })

  describe('Interaction Logic', () => {
    it('is interactive implicitly if onSelect is provided', async () => {
      const onSelectMock = vi.fn()
      const wrapper = mountComponent({ onSelect: onSelectMock })

      const card = wrapper.findComponent({ name: 'BaseCard' })

      // Should have interactive class
      expect(card.classes()).toContain('interactive')
      // Should have ripple enabled
      expect(card.props('ripple')).toBe(true)

      // Click
      await card.trigger('click')
      expect(onSelectMock).toHaveBeenCalledWith(expect.objectContaining({ id: 123 }))
    })

    it('is static implicitly if onSelect is missing', async () => {
      const wrapper = mountComponent() // No onSelect

      const card = wrapper.findComponent({ name: 'BaseCard' })

      // Should have static class
      expect(card.classes()).toContain('static-card')
      // Should NOT have ripple
      expect(card.props('ripple')).toBe(false)
    })

    it('forces static mode if clickable is false, even if onSelect exists', async () => {
      const onSelectMock = vi.fn()
      const wrapper = mountComponent({
        onSelect: onSelectMock,
        clickable: false
      })

      const card = wrapper.findComponent({ name: 'BaseCard' })

      expect(card.classes()).toContain('static-card')

      // Click
      await card.trigger('click')
      // Should not call the callback because isInteractive is false
      expect(onSelectMock).not.toHaveBeenCalled()
    })

    it('forces interactive mode if clickable is true', async () => {
      const wrapper = mountComponent({ clickable: true }) // No onSelect

      const card = wrapper.findComponent({ name: 'BaseCard' })
      expect(card.classes()).toContain('interactive')
    })
  })
})
