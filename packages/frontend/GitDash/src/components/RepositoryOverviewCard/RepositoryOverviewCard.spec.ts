import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RepositoryOverviewCard from './RepositoryOverviewCard.vue'

// Mock data
const mockRepo = {
  id: 1,
  fullName: 'facebook/react',
  description: 'A JS library for building UIs',
  starred: 200000,
  forked: 40000,
  languages: ['JavaScript', 'HTML'],
  // ... other fields required by IRepository type
  isPrivate: false,
  url: '',
  sshUrl: '',
  cloneUrl: '',
  htmlUrl: '',
  watchers: 0,
  owner: { login: 'facebook', avatarUrl: '' },
  createdAt: '',
  updatedAt: ''
}

describe('RepositoryOverviewCard.vue', () => {
  const mountComponent = (repoOverride = {}) => {
    return mount(RepositoryOverviewCard, {
      props: {
        repo: { ...mockRepo, ...repoOverride }
      },
      global: {
        stubs: {
          BaseCard: { template: '<div><slot /></div>' },
          'v-row': { template: '<div class="v-row"><slot /></div>' },
          'v-col': { template: '<div class="v-col"><slot /></div>' },
          'v-divider': true
        }
      }
    })
  }

  it('renders repository name', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('h3').text()).toBe('facebook/react')
  })

  it('renders description when provided', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('A JS library for building UIs')
  })

  it('renders fallback text when description is missing', () => {
    const wrapper = mountComponent({ description: null })
    expect(wrapper.text()).toContain('No description available.')
  })

  it('renders statistics correctly', () => {
    const wrapper = mountComponent()
    const text = wrapper.text()

    // Stars
    expect(text).toContain('200000')
    expect(text).toContain('Stars')

    // Forks
    expect(text).toContain('40000')
    expect(text).toContain('Forks')

    // Languages
    // Vue 3 renders arrays as JSON (e.g. ["JavaScript", "HTML"])
    // So we check for the individual items instead of "JavaScript,HTML"
    expect(text).toContain('JavaScript')
    expect(text).toContain('HTML')
    expect(text).toContain('Issues')
  })
})
