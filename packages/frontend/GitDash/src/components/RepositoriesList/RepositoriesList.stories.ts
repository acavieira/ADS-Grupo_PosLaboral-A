/*import RepositoriesList from './RepositoriesList.vue';

export default {
  title: 'Components/RepositoriesList',
  component: RepositoriesList,
};

const Template = (args: any) => ({
  components: { RepositoriesList },
  setup() {
    return { args };
  },
  template: `<RepositoriesList v-bind="args" />`,
});

export const Default = Template.bind({});
Default.args = {
  repositories: [
    { id: 1, name: 'awesome-project', description: 'React project', stars: 1200, forks: 230 },
    { id: 2, name: 'vue-dashboard', description: 'Built with Vue', stars: 800, forks: 100 },
  ],
  onSelect: (repo: any) => console.log('Selected repo:', repo),
};*/