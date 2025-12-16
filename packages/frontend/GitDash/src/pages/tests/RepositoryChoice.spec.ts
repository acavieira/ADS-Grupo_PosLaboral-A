import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { ref } from 'vue'

// Component under test
import RepositoryChoice from '@/pages/RepositoryChoice.vue'

// Child components (for existence checks and interaction)
import RepositoryCard from '@/components/RepositoryCard/RepositoryCard.vue'
import UserRepositoriesCard from '@/components/UserRepositoriesCard/UserRepositoriesCard.vue'
import { UrlInputCard, BaseButton } from '@git-dash/ui'

// Mock Dependencies
import { ApiClientKey } from '@/plugins/api'

// 1. Mock Vue Router
const mockRouterPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockRouterPush
  })
}))

// 2. Mock Pinia Store
const mockSetCurrentRepository = vi.fn()
vi.mock('@/stores/repository', () => ({
  useRepositoryStore: () => ({
    setCurrentRepository: mockSetCurrentRepository
  })
}))

// 3. Mock Composable
// We use a factory function to easily change return values in tests
const mockUseRepositories = {
  allRepositories: ref([]),
  recentRepositories: ref([]),
  isLoading: ref(false),
  isUrlLoading: ref(false),
  init: vi.fn(),
  loadRepositoryByUrl: vi.fn()
}

vi.mock('@/composables/useRepositories', () => ({
  useRepositories: () => mockUseRepositories
}))

// 4. Mock the ApiClientKey import
// This ensures we can use the symbol in the test without needing the actual file
vi.mock('@/plugins/api', () => ({
  ApiClientKey: Symbol('ApiClientKey')
}))

describe('RepositoryChoice', () => {
  // Mock API instance to be injected
  const mockApi = {
    post: vi.fn()
  }

  // Common config for shallowMount
  const mountOptions = {
    global: {
      provide: {
        [ApiClientKey as symbol]: mockApi
      },
      stubs: {
        // Essential: ensure grid components render their slots
        'v-row': { template: '<div><slot /></div>' },
        'v-col': { template: '<div><slot /></div>' },
        'v-app': { template: '<div><slot /></div>' },
        'v-main': { template: '<div><slot /></div>' },
        'v-container': { template: '<div><slot /></div>' },
        // Stub alert to easily find it by tag name or text
        'v-alert': { template: '<div><slot /></div>' },
        'v-progress-circular': true
      }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset reactive refs to default state
    mockUseRepositories.allRepositories.value = []
    mockUseRepositories.recentRepositories.value = []
    mockUseRepositories.isLoading.value = false
    mockUseRepositories.isUrlLoading.value = false
  })

  it('initializes repositories on mount', () => {
    shallowMount(RepositoryChoice, mountOptions)
    expect(mockUseRepositories.init).toHaveBeenCalled()
  })

  it('renders loading state correctly', () => {
    // Arrange
    mockUseRepositories.isLoading.value = true

    const wrapper = shallowMount(RepositoryChoice, mountOptions)

    // Assert: Loader visible
    expect(wrapper.find('v-progress-circular-stub').exists()).toBe(true)
    // Assert: Recent repos not visible (UserRepositoriesCard is always visible in structure though)
    expect(wrapper.findAllComponents(RepositoryCard).length).toBe(0)
  })

  it('renders list of recent repositories', () => {
    // Arrange
    mockUseRepositories.isLoading.value = false
    mockUseRepositories.recentRepositories.value = [
      { fullName: 'org/repo-1' },
      { fullName: 'org/repo-2' }
    ] as any

    const wrapper = shallowMount(RepositoryChoice, mountOptions)

    // Assert
    const repoCards = wrapper.findAllComponents(RepositoryCard)
    expect(repoCards.length).toBe(2)
  })

  it('handles Logout interaction', async () => {
    const wrapper = shallowMount(RepositoryChoice, mountOptions)

    // Find the Logout button
    const logoutBtn = wrapper.findComponent(BaseButton)
    expect(logoutBtn.exists()).toBe(true)

    // Trigger click
    await logoutBtn.trigger('click')

    // Assert
    expect(mockApi.post).toHaveBeenCalledWith('/logout')
    expect(mockRouterPush).toHaveBeenCalledWith('/')
  })

  it('handles Repository Selection', () => {
    const wrapper = shallowMount(RepositoryChoice, mountOptions)
    const testRepo = { fullName: 'test/repo' } as any

    // We can trigger the logic via the UserRepositoriesCard prop
    const userReposCard = wrapper.findComponent(UserRepositoriesCard)

    // Simulate the onSelect callback
    userReposCard.vm.$emit('select', testRepo)
    // OR if passed as a prop :onSelect, we execute the prop:
    const onSelectProp = userReposCard.props('onSelect')
    onSelectProp(testRepo)

    // Assert
    expect(mockSetCurrentRepository).toHaveBeenCalledWith(testRepo)
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'repository-details' })
  })

  it('handles Load By URL - Success', async () => {
    const wrapper = shallowMount(RepositoryChoice, mountOptions)
    const testRepo = { fullName: 'url/repo' } as any
    const testUrl = 'https://github.com/url/repo'

    // Mock successful API response
    mockUseRepositories.loadRepositoryByUrl.mockResolvedValue(testRepo)

    // Find UrlInputCard and emit event
    const urlCard = wrapper.findComponent(UrlInputCard)
    await urlCard.vm.$emit('load-url', testUrl)

    // Assert
    expect(mockUseRepositories.loadRepositoryByUrl).toHaveBeenCalledWith(testUrl)
    expect(mockSetCurrentRepository).toHaveBeenCalledWith(testRepo)
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'repository-details' })

    // Ensure no error alert exists
    expect(wrapper.find('v-alert-stub').exists()).toBe(false)
  })

})
