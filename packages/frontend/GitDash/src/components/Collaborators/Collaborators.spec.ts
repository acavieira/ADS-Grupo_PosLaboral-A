import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Collaborators from './Collaborators.vue'
import PseudonymAvatar from './PseudonymAvatar.vue'

// Mock data types to match component interface
type Role = 'admin' | 'write' | 'read'
interface Collaborator {
  login: string
  avatarUrl: string
  role: Role
  commits: number
  pullRequests: number
  issues: number
  displayName?: string
}

describe('Collaborators.vue', () => {
  const mockCollaborators: Collaborator[] = [
    {
      login: 'octocat',
      displayName: 'The Octocat',
      avatarUrl: 'https://github.com/images/error/octocat_happy.gif',
      role: 'admin',
      commits: 50,
      pullRequests: 10,
      issues: 5
    },
    {
      login: 'dev-user',
      avatarUrl: 'https://example.com/avatar.jpg',
      role: 'write',
      commits: 20,
      pullRequests: 5,
      issues: 2
    },
    {
      login: 'guest-user',
      displayName: 'Guest',
      avatarUrl: 'https://example.com/avatar2.jpg',
      role: 'read',
      commits: 0,
      pullRequests: 0,
      issues: 0
    }
  ]

  const mountComponent = (collaborators: Collaborator[] = []) => {
    return mount(Collaborators, {
      props: { collaborators },
      global: {
        stubs: {
          BaseCard: { template: '<div><slot /></div>' },
          'v-table': { template: '<table><slot /></table>' },
          // FIX: Added name property here so findComponent can locate it
          'v-chip': {
            name: 'v-chip',
            template: '<div class="v-chip"><slot /></div>',
            props: ['color', 'variant']
          },
          'v-icon': { template: '<span class="v-icon"><slot /></span>' },
          'v-avatar': true,
          'v-img': true,
        }
      }
    })
  }

  it('renders the correct number of rows', () => {
    const wrapper = mountComponent(mockCollaborators)

    expect(wrapper.text()).toContain(`Collaborators (${mockCollaborators.length})`)
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(mockCollaborators.length)
  })

  it('renders collaborator details correctly', () => {
    const wrapper = mountComponent(mockCollaborators)
    const firstRowText = wrapper.findAll('tbody tr')[0].text()

    expect(firstRowText).toContain('The Octocat')
    expect(firstRowText).toContain('@octocat')
    expect(firstRowText).toContain('50')
    expect(firstRowText).toContain('10')
  })

  it('falls back to login if displayName is missing', () => {
    const wrapper = mountComponent(mockCollaborators)
    const secondRow = wrapper.findAll('tbody tr')[1]

    expect(secondRow.find('.font-weight-bold').text()).toBe('dev-user')
  })

  it('assigns correct colors and icons based on role (Admin)', () => {
    const wrapper = mountComponent([mockCollaborators[0]])

    // FIX: Changed selector to string 'v-chip' which is more robust for stubs
    const chip = wrapper.findComponent({ name: 'v-chip' })
    const icon = wrapper.find('.v-icon')

    expect(chip.exists()).toBe(true) // Added sanity check
    expect(chip.props('color')).toBe('black')
    expect(icon.text()).toBe('mdi-shield-crown')
    expect(wrapper.text()).toContain('admin')
  })

  it('assigns correct colors and icons based on role (Write)', () => {
    const wrapper = mountComponent([mockCollaborators[1]])

    const chip = wrapper.findComponent({ name: 'v-chip' })
    const icon = wrapper.find('.v-icon')

    expect(chip.props('color')).toBe('blue-darken-4')
    expect(icon.text()).toBe('mdi-fountain-pen-tip')
    expect(wrapper.text()).toContain('write')
  })

  it('assigns correct colors and icons based on role (Read)', () => {
    const wrapper = mountComponent([mockCollaborators[2]])

    const chip = wrapper.findComponent({ name: 'v-chip' })
    const icon = wrapper.find('.v-icon')

    expect(chip.props('color')).toBe('grey-lighten-1')
    expect(icon.text()).toBe('mdi-eye-outline')
    expect(wrapper.text()).toContain('read')
  })

  it('shows avatars and @login by default', () => {
    const wrapper = mountComponent(mockCollaborators)

    expect(wrapper.findAll('v-avatar-stub')).toHaveLength(mockCollaborators.length)
    expect(wrapper.findAllComponents(PseudonymAvatar)).toHaveLength(0)
    expect(wrapper.text()).toContain('@octocat')
    expect(wrapper.text()).not.toContain('pseudonyms')
  })

  it('shows a generic avatar and hides @login when pseudonymize is on', () => {
    const pseudonymized: Collaborator[] = [
      { login: 'Colaborador 1', avatarUrl: '', role: 'write', commits: 9, pullRequests: 2, issues: 1 },
      { login: 'Colaborador 2', avatarUrl: '', role: 'read', commits: 3, pullRequests: 0, issues: 0 }
    ]
    const wrapper = mount(Collaborators, {
      props: { collaborators: pseudonymized, pseudonymize: true },
      global: {
        stubs: {
          BaseCard: { template: '<div><slot /></div>' },
          'v-table': { template: '<table><slot /></table>' },
          'v-chip': { template: '<div class="v-chip"><slot /></div>' },
          'v-icon': { template: '<span class="v-icon"><slot /></span>' },
          'v-avatar': true,
          'v-img': true,
        }
      }
    })

    // One generic avatar per row, and no real image is requested
    expect(wrapper.findAllComponents(PseudonymAvatar)).toHaveLength(pseudonymized.length)
    expect(wrapper.findAll('v-img-stub')).toHaveLength(0)
    expect(wrapper.text()).toContain('Colaborador 1')
    expect(wrapper.text()).not.toContain('@')
    expect(wrapper.text()).toContain('does not guarantee anonymity')
    // The individual views work with pseudonyms, so the notice must not say they are hidden
    expect(wrapper.text()).not.toContain('individual views')
  })

  it('emits update:pseudonymize when the switch changes', async () => {
    const wrapper = mountComponent(mockCollaborators)

    await wrapper.findComponent({ name: 'VSwitch' }).vm.$emit('update:modelValue', true)

    expect(wrapper.emitted('update:pseudonymize')).toEqual([[true]])
  })

  it('displays empty state message when list is empty', () => {
    const wrapper = mountComponent([])

    expect(wrapper.text()).toContain('Collaborators (0)')
    expect(wrapper.text()).toContain('No collaborators found')

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(1)
  })
})
