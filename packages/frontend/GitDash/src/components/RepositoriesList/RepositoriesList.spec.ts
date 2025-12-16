import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RepositoriesList from './RepositoriesList.vue'

// Mock data
const mockRepos = [
  { id: 1, fullName: 'owner/repo-a', description: 'Repo A' },
  { id: 2, fullName: 'owner/repo-b', description: 'Repo B' }
]

describe('RepositoriesList.vue', () => {
  const mountComponent = (onSelect = vi.fn()) => {
    return mount(RepositoriesList, {
      props: {
        repositories: mockRepos as any, // Cast to any to avoid mocking the full IRepository interface
        onSelect
      },
      global: {
        stubs: {
          // FIX: Added 'name' property so findComponent can locate it
          'v-select': {
            name: 'v-select',
            template: '<div class="v-select"></div>',
            props: ['items', 'itemTitle', 'itemValue', 'label']
          }
        }
      }
    })
  }

  it('passes repository list to v-select', () => {
    const wrapper = mountComponent()
    const select = wrapper.findComponent({ name: 'v-select' })

    // Check if the items prop received the list
    expect(select.props('items')).toEqual(mockRepos)
    // Check configuration props
    expect(select.props('itemTitle')).toBe('fullName')
    expect(select.props('itemValue')).toBe('fullName')
  })

  it('calls onSelect with the full repository object when a selection is made', async () => {
    const onSelectMock = vi.fn()
    const wrapper = mountComponent(onSelectMock)
    const select = wrapper.findComponent({ name: 'v-select' })

    // Simulate v-select emitting the selected string value (fullName)
    // We select the second repo: 'owner/repo-b'
    await select.vm.$emit('update:modelValue', 'owner/repo-b')

    // Expect the callback to be called with the matching OBJECT, not the string
    expect(onSelectMock).toHaveBeenCalledWith(mockRepos[1])
  })

  it('does not trigger onSelect if the repository name is not found', async () => {
    const onSelectMock = vi.fn()
    const wrapper = mountComponent(onSelectMock)
    const select = wrapper.findComponent({ name: 'v-select' })

    // Simulate selecting a value that doesn't exist in the list
    await select.vm.$emit('update:modelValue', 'non-existent/repo')

    expect(onSelectMock).not.toHaveBeenCalled()
  })
})
