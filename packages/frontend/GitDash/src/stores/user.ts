// src/stores/user.ts
import { defineStore } from 'pinia';
import axios from 'axios';

export const useUserStore = defineStore('user', {
  state: () => ({
    userName: '' as string,
    loading: false,
    error: '' as string
  }),
  actions: {
    async fetchUser() {
      this.loading = true;
      this.error = '';
      try {
        const response = await axios.get('/api/user', { withCredentials: true });
        this.userName = response.data.userName;
      } catch (err: any) {
        this.error = 'Not authenticated';
        this.userName = '';
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      await axios.get('/logout', { withCredentials: true });
      this.userName = '';
    }
  }
});
