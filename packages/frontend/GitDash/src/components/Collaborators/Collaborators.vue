<template>
  <BaseCard class="pa-6">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-subtitle-1 font-weight-medium">
        Collaborators ({{ collaborators.length }})
      </h2>
    </div>

    <!-- Table -->
    <v-table density="comfortable">
      <thead>
        <tr>
          <th class="text-left">Collaborator</th>
          <th class="text-left">Role</th>
          <th class="text-right">Commits</th>
          <th class="text-right">PRs</th>
          <th class="text-right">Issues</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="c in collaborators"
          :key="c.login"
        >
          <!-- Collaborator (avatar + name + @login) -->
          <td>
            <div class="d-flex align-center ga-3">
              <v-avatar size="32">
                <v-img
                  :src="c.avatarUrl"
                  :alt="c.login"
                />
              </v-avatar>

              <div class="d-flex flex-column">
                <span class="text-body-2 font-weight-medium">
                  {{ c.displayName || c.login }}
                </span>
                <span class="text-caption text-medium-emphasis">
                  @{{ c.login }}
                </span>
              </div>
            </div>
          </td>

          <!-- Role -->
          <td>
            <v-chip
              size="small"
              :color="roleColor(c.role)"
              :variant="c.role === 'read' ? 'tonal' : 'elevated'"
              class="text-caption text-capitalize"
            >
              {{ c.role }}
            </v-chip>
          </td>

          <!-- Commits -->
          <td class="text-right">
            {{ c.commits }}
          </td>

          <!-- PRs -->
          <td class="text-right">
            {{ c.pullRequests }}
          </td>

          <!-- Issues -->
          <td class="text-right">
            {{ c.issues }}
          </td>
        </tr>

        <tr v-if="!collaborators.length">
          <td colspan="5" class="text-center text-medium-emphasis py-6">
            No collaborators found for this repository and time range.
          </td>
        </tr>
      </tbody>
    </v-table>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from '@/components/BaseCard/BaseCard.vue'

type Role = 'admin' | 'write' | 'read'

interface Collaborator {
  login: string              // GitHub username
  avatarUrl: string
  role: Role
  commits: number
  pullRequests: number
  issues: number
  // opcional: nome "bonito" se algum dia o backend enviar
  displayName?: string
}

const props = defineProps<{
  collaborators: Collaborator[]
}>()

function roleColor(role: Role) {
  switch (role) {
    case 'admin':
      return 'black'
    case 'write':
      return 'primary'
    case 'read':
      return 'grey-lighten-2'
    default:
      return 'grey-lighten-2'
  }
}
</script>

<style scoped>
th {
  font-weight: 500;
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
}

td {
  font-size: 0.9rem;
}
</style>
