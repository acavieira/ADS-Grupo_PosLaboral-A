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
import { PSEUDONYM_AVATAR_SRC } from '@/components/Collaborators/pseudonymAvatar'
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
  pseudonymize: ref(false),
  repositoryLabel: ref<string | null>(null),
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
          props: ['tabs', 'activeTab', 'repositoryName']
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
    mockCollaboratorsState.pseudonymize.value = false
    mockCollaboratorsState.repositoryLabel.value = null
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

  it('keeps the avatar tabs with the generic avatar when pseudonymization is on', () => {
    mockCollaboratorsState.collaborators.value = [
      { login: 'Colaborador 1', avatarUrl: 'https://avatars.example/real-1' },
      { login: 'Colaborador 2', avatarUrl: 'https://avatars.example/real-2' }
    ]
    mockCollaboratorsState.pseudonymize.value = true

    const wrapper = shallowMount(RepositoryDetails, mountOptions)

    const tabsProp = wrapper.findComponent(BaseLayout).props('tabs')
    expect(tabsProp.map((t: { key: string }) => t.key)).toEqual([
      'overview',
      'collaborators',
      'Colaborador 1',
      'Colaborador 2'
    ])
    // The real avatar never reaches the tab bar
    expect(tabsProp.slice(2).map((t: { icon?: string }) => t.icon)).toEqual([
      PSEUDONYM_AVATAR_SRC,
      PSEUDONYM_AVATAR_SRC
    ])
  })

  it('shows the real repository name when pseudonymization is off', () => {
    const wrapper = shallowMount(RepositoryDetails, mountOptions)

    expect(wrapper.findComponent(BaseLayout).props('repositoryName')).toBe('test-org/test-repo')
    expect(wrapper.findComponent(Overview).props('repositoryName')).toBe('test-org/test-repo')
  })

  it('shows the label from the API instead of the owner when pseudonymization is on', () => {
    mockCollaboratorsState.pseudonymize.value = true
    mockCollaboratorsState.repositoryLabel.value = 'Colaborador 1/test-repo'

    const wrapper = shallowMount(RepositoryDetails, mountOptions)

    expect(wrapper.findComponent(BaseLayout).props('repositoryName')).toBe('Colaborador 1/test-repo')
    expect(wrapper.findComponent(Overview).props('repositoryName')).toBe('Colaborador 1/test-repo')
  })

  it('hides the owner while there is no label yet, so the real name never shows', () => {
    mockCollaboratorsState.pseudonymize.value = true

    const wrapper = shallowMount(RepositoryDetails, mountOptions)

    expect(wrapper.findComponent(BaseLayout).props('repositoryName')).toBe('•••/test-repo')
  })

  it('opens the individual view of a pseudonymized tab with the opaque reference', async () => {
    mockCollaboratorsState.collaborators.value = [
      { login: 'Colaborador 1', avatarUrl: '', reference: '~opaque-1' }
    ]
    mockCollaboratorsState.pseudonymize.value = true

    const wrapper = shallowMount(RepositoryDetails, mountOptions)
    await wrapper.findComponent(BaseLayout).vm.$emit('tab-change', 'Colaborador 1')

    // The API gets the reference, never the alias (and the real login is not known here)
    const stats = wrapper.findComponent(PersonalStats)
    expect(stats.exists()).toBe(true)
    expect(stats.props('collaborator')).toBe('~opaque-1')
  })

  it('goes back to the table when the pseudonymized list changes under an open individual view', async () => {
    mockCollaboratorsState.collaborators.value = [
      { login: 'Colaborador 1', avatarUrl: '', reference: '~opaque-1' }
    ]
    mockCollaboratorsState.pseudonymize.value = true

    const wrapper = shallowMount(RepositoryDetails, mountOptions)
    await wrapper.findComponent(BaseLayout).vm.$emit('tab-change', 'Colaborador 1')
    expect(wrapper.findComponent(PersonalStats).exists()).toBe(true)

    // A new request renumbers the aliases: "Colaborador 1" may now be someone else
    mockCollaboratorsState.collaborators.value = [
      { login: 'Colaborador 1', avatarUrl: '', reference: '~opaque-2' }
    ]
    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent(PersonalStats).exists()).toBe(false)
    expect(wrapper.findComponent(CollaboratorsTable).exists()).toBe(true)
  })

  it('passes the pseudonymize option to the collaborators table', async () => {
    mockCollaboratorsState.pseudonymize.value = true

    const wrapper = shallowMount(RepositoryDetails, mountOptions)
    await wrapper.findComponent(BaseLayout).vm.$emit('tab-change', 'collaborators')

    expect(wrapper.findComponent(CollaboratorsTable).props('pseudonymize')).toBe(true)
  })

  it('swaps the real avatars for the generic one once the table turns pseudonymization on', async () => {
    mockCollaboratorsState.collaborators.value = [
      { login: 'dev1', avatarUrl: 'img1' },
      { login: 'dev2', avatarUrl: 'img2' }
    ]

    const wrapper = shallowMount(RepositoryDetails, mountOptions)
    const layout = wrapper.findComponent(BaseLayout)
    const icons = () =>
      layout.props('tabs').filter((t: { icon?: string }) => t.icon).map((t: { icon?: string }) => t.icon)
    expect(icons()).toEqual(['img1', 'img2'])

    // The switch lives in the table: emulate the v-model event it emits
    await layout.vm.$emit('tab-change', 'collaborators')
    wrapper.findComponent(CollaboratorsTable).vm.$emit('update:pseudonymize', true)
    await wrapper.vm.$nextTick()

    expect(mockCollaboratorsState.pseudonymize.value).toBe(true)
    expect(icons()).toEqual([PSEUDONYM_AVATAR_SRC, PSEUDONYM_AVATAR_SRC])
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
