<template>
  <BaseCard class="pa-6">
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h6 font-weight-medium">
        Collaborators ({{ collaborators.length }})
      </h2>
    </div>

    <v-table density="comfortable">
      <thead>
      <tr>
        <th class="text-left text-body-2 font-weight-bold text-medium-emphasis">Collaborator</th>
        <th class="text-left text-body-2 font-weight-bold text-medium-emphasis">Role</th>
        <th class="text-right text-body-2 font-weight-bold text-medium-emphasis">Commits</th>
        <th class="text-right text-body-2 font-weight-bold text-medium-emphasis">PRs</th>
        <th class="text-right text-body-2 font-weight-bold text-medium-emphasis">Issues</th>
      </tr>
      </thead>

      <tbody>
      <tr
        v-for="c in collaborators"
        :key="c.login"
      >
        <td class="py-3">
          <div class="d-flex align-center ga-3">
            <v-avatar size="32" class="border">
              <v-img
                :src="c.avatarUrl"
                :alt="c.login"
                cover
              />
            </v-avatar>

            <div class="d-flex flex-column">
                <span class="text-body-2 font-weight-bold">
                  {{ c.displayName || c.login }}
                </span>
              <span class="text-caption text-medium-emphasis">
                  @{{ c.login }}
                </span>
            </div>
          </div>
        </td>

        <td>
          <v-chip
            size="small"
            :color="getRoleColor(c.role)"
            variant="flat"
            class="font-weight-bold text-uppercase"
            label
          >
            <v-icon start size="14">
              {{ getRoleIcon(c.role) }}
            </v-icon>
            {{ c.role }}
          </v-chip>
        </td>

        <td class="text-right font-weight-medium">
          {{ c.commits }}
        </td>

        <td class="text-right font-weight-medium">
          {{ c.pullRequests }}
        </td>

        <td class="text-right font-weight-medium">
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
import { BaseCard } from '@git-dash/ui'

type Role = 'admin' | 'write' | 'read'

interface Collaborator {
  login: string
  avatarUrl: string
  role: Role
  commits: number
  pullRequests: number
  issues: number
  displayName?: string
}

const props = defineProps<{
  collaborators: Collaborator[]
}>()

function getRoleColor(role: Role) {
  switch (role) {
    case 'admin':
      return 'black'
    case 'write':
      return 'blue-darken-4'
    case 'read':
      return 'grey-lighten-1'
    default:
      return 'grey-lighten-1'
  }
}

function getRoleIcon(role: Role) {
  switch (role) {
    case 'admin':
      return 'mdi-shield-crown'
    case 'write':
      return 'mdi-fountain-pen-tip'
    case 'read':
      return 'mdi-eye-outline'
    default:
      return 'mdi-account'
  }
}
</script>

<style scoped>
th {
  white-space: nowrap;
}
</style>
