/*import { mount } from '@vue/test-utils';
import RepositoryOverviewCard from './RepositoryOverviewCard.vue';
import { describe, expect, it } from 'vitest';

describe('RepositoryOverviewCard', () => {
  const repo = {
    name: 'test-repo',
    description: 'Repo for testing',
    stars: 10,
    forks: 5,
    issues: 2,
    prs: 1,
    commits: 50,
    language: 'JavaScript',
  };

  it('renders repository name and description', () => {
    const wrapper = mount(RepositoryOverviewCard, { props: { repo } });
    expect(wrapper.text()).toContain('test-repo');
    expect(wrapper.text()).toContain('Repo for testing');
  });

  it('shows repo stats', () => {
    const wrapper = mount(RepositoryOverviewCard, { props: { repo } });
    expect(wrapper.text()).toContain('10');
    expect(wrapper.text()).toContain('5');
    expect(wrapper.text()).toContain('2');
  });
});*/
