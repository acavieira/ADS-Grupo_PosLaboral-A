import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserRepositoriesCard from './UserRepositoriesCard.vue'

describe('UserRepositoriesCard.vue', () => {
  // Mock data
  const mockRepos = [
    { id: 1, fullName: 'user/repo-1' },
    { id: 2, fullName: 'user/repo-2' }
  ]

  const mountComponent = (onSelect = vi.fn()) => {
    return mount(UserRepositoriesCard, {
      props: {
        repositories: mockRepos as any,
        onSelect
      },
      global: {
        stubs: {
          BaseCard: { template: '<div><slot /></div>' },
          RepositoriesList: {
            name: 'RepositoriesList',
            template: '<div data-test="repo-list"></div>',
            props: ['repositories', 'onSelect']
          }
        }
      }
    })
  }

  it('renders title and description', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Your Repositories')
    expect(wrapper.text()).toContain('Select from your accessible repositories')
  })

  it('passes the repositories prop down to RepositoriesList', () => {
    const wrapper = mountComponent()

    const list = wrapper.findComponent({ name: 'RepositoriesList' })

    expect(list.props('repositories')).toEqual(mockRepos)
  })

  it('passes the onSelect callback down to RepositoriesList', () => {
    const onSelectMock = vi.fn()
    const wrapper = mountComponent(onSelectMock)

    const list = wrapper.findComponent({ name: 'RepositoriesList' })

    // Verify the function passed is the same one we provided
    const childOnSelect = list.props('onSelect')

    // Execute the function prop from the child stub
    childOnSelect({ id: 1, fullName: 'user/repo-1' })

    // Verify the parent spy was called
    expect(onSelectMock).toHaveBeenCalledWith({ id: 1, fullName: 'user/repo-1' })
  })
})
