import { mount } from '@vue/test-utils';
import BaseLayout from './BaseLayout.vue';
import { describe, expect, it } from 'vitest';

describe('BaseLayout', () => {
  it('renders slot content', () => {
    const wrapper = mount(BaseLayout, {
      slots: {
        default: '<div>Content</div>',
      },
    });
    expect(wrapper.text()).toContain('Content');
  });
});
