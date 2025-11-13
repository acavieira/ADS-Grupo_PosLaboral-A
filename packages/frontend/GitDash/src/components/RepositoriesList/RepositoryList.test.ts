/*import { mount } from '@vue/test-utils';
import RepositoriesList from './RepositoriesList.vue';

describe('RepositoriesList', () => {
  const repos = [
    { id: 1, name: 'repo1', description: 'Test repo 1', stars: 10, forks: 5 },
    { id: 2, name: 'repo2', description: 'Test repo 2', stars: 20, forks: 15 },
  ];

  it('renders a list of repositories', () => {
    const wrapper = mount(RepositoriesList, {
      props: { repositories: repos },
    });
    expect(wrapper.text()).toContain('repo1');
    expect(wrapper.text()).toContain('repo2');
  });

  it('emits onSelect when repository is clicked', async () => {
    const wrapper = mount(RepositoriesList, {
      props: { repositories: repos, onSelect: vi.fn() },
    });
    await wrapper.findAll('.v-card')[0].trigger('click');
    expect(wrapper.props('onSelect')).toBeDefined();
  });
});*/
