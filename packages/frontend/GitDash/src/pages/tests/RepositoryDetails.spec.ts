import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { ref } from 'vue'

// Component under test
import RepositoryDetails from '@/pages/RepositoryDetails.vue'

// Child components
import BaseLayout from '@/components/BaseLayout/BaseLayout.vue'
import Overview from '@/pages/Overview.vue'
import CollaboratorsTable from '@/components/Collaborators/Collaborators.vue'
import PersonalStats from '@/pages/PersonalStats.vue'
import { DataErrorAlert } from '@git-dash/ui'

// 1. Mock the Store
// We mock the return value to already contain refs so storeToRefs works naturally
vi.mock('@/stores/repository.ts', () => ({
  useRepositoryStore: () => ({
    currentRepository: ref({ fullName: 'test-org/test-repo' })
  })
}))

// 2. Mock the Composable
// We use a mutable object so we can change state inside tests
const mockCollaboratorsState = {
  collaborators: ref<any[]>([]),
  isLoading: ref(false),
  error: ref<Error | null>(null),
  fetchCollaborators: vi.fn()
}

vi.mock('@/composables/useRepositoryCollaborators', () => ({
  useRepositoryCollaborators: () => mockCollaboratorsState
}))

describe('RepositoryDetailsPage', () => {
  const mountOptions = {
    global: {
      stubs: {
        // We stub BaseLayout but we MUST ensure it renders the default slot
        // so we can check what is inside the page content
        BaseLayout: {
          template: '<div><slot /></div>',
          props: ['tabs', 'activeTab']
        },
        // Vuetify stubs
        'v-card': { template: '<div><slot /></div>' },
        'v-card-text': { template: '<div><slot /></div>' },
        'v-col': { template: '<div><slot /></div>' },
        'v-progress-circular': true
      }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset state
    mockCollaboratorsState.collaborators.value = []
    mockCollaboratorsState.isLoading.value = false
    mockCollaboratorsState.error.value = null
  })

  it('renders Loading state correctly', () => {
    // Arrange
    mockCollaboratorsState.isLoading.value = true

    const wrapper = shallowMount(RepositoryDetails, mountOptions)

    // Assert: Spinner exists
    expect(wrapper.find('v-progress-circular-stub').exists()).toBe(true)

    // Assert: Content should not exist
    expect(wrapper.findComponent(Overview).exists()).toBe(false)
  })

  it('renders Overview tab by default', () => {
    // Arrange
    mockCollaboratorsState.isLoading.value = false

    const wrapper = shallowMount(RepositoryDetails, mountOptions)

    // Assert: Check default active tab logic
    expect(wrapper.findComponent(Overview).exists()).toBe(true)
    expect(wrapper.findComponent(CollaboratorsTable).exists()).toBe(false)
  })

  it('switches to Collaborators tab and displays table', async () => {
    const wrapper = shallowMount(RepositoryDetails, mountOptions)

    // Simulate tab change event from BaseLayout
    // Since we stubbed BaseLayout, we find the stub and emit the event it would usually emit
    const layout = wrapper.findComponent(BaseLayout)
    await layout.vm.$emit('tab-change', 'collaborators')

    // Assert: Overview gone, Table present
    expect(wrapper.findComponent(Overview).exists()).toBe(false)
    expect(wrapper.findComponent(CollaboratorsTable).exists()).toBe(true)

    // Check if error alert is NOT present
    expect(wrapper.findComponent(DataErrorAlert).exists()).toBe(false)
  })

  it('displays Error Alert in Collaborators tab on error', async () => {
    // Arrange
    mockCollaboratorsState.error.value = new Error('Permission denied')

    const wrapper = shallowMount(RepositoryDetails, mountOptions)

    // Switch to collaborators tab
    const layout = wrapper.findComponent(BaseLayout)
    await layout.vm.$emit('tab-change', 'collaborators')

    // Assert
    expect(wrapper.findComponent(CollaboratorsTable).exists()).toBe(false)
    expect(wrapper.findComponent(DataErrorAlert).exists()).toBe(true)
  })

  it('generates dynamic tabs for collaborators', () => {
    // Arrange: Add collaborators
    mockCollaboratorsState.collaborators.value = [
      { login: 'dev1', avatarUrl: 'img1' },
      { login: 'dev2', avatarUrl: 'img2' }
    ]

    const wrapper = shallowMount(RepositoryDetails, mountOptions)

    // Check props passed to BaseLayout
    const layout = wrapper.findComponent(BaseLayout)
    const tabsProp = layout.props('tabs')

    // Should include: Overview + Collaborators + 2 Users = 4 tabs
    expect(tabsProp.length).toBe(4)
    expect(tabsProp[2].key).toBe('dev1')
    expect(tabsProp[3].key).toBe('dev2')
  })

  it('renders PersonalStats when a collaborator tab is active', async () => {
    // Arrange
    mockCollaboratorsState.collaborators.value = [
      { login: 'cool-dev', avatarUrl: '...' }
    ]

    const wrapper = shallowMount(RepositoryDetails, mountOptions)

    // Switch to the user's tab
    const layout = wrapper.findComponent(BaseLayout)
    await layout.vm.$emit('tab-change', 'cool-dev')

    // Assert
    const statsComponent = wrapper.findComponent(PersonalStats)
    expect(statsComponent.exists()).toBe(true)
    expect(statsComponent.props('collaborator')).toBe('cool-dev')

    // Ensure other components are hidden
    expect(wrapper.findComponent(Overview).exists()).toBe(false)
    expect(wrapper.findComponent(CollaboratorsTable).exists()).toBe(false)
  })
})
