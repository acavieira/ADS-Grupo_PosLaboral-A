/*import { ApiClient, ApiClientBuilder } from '@git-dash/core'
import type { InjectionKey } from 'vue'
import { appLogger } from './logger.ts'

const baseUrl = import.meta.env.VITE_BACKEND_URL;

if (!baseUrl) {
  console.error("VITE_BACKEND_URL is not defined. API Client will not initialize correctly.");
}

export const apiClient = ApiClientBuilder.create(baseUrl)
  .withClientName('Main-Backend-Client')
  .withLogger(appLogger)
  .withCredentials(true) // Required for cookie/session management
  .withTimeout(200000) // adjust later, now is too big 20 sec
  .withRetryPolicy(3)
  .build();

export const ApiClientKey: InjectionKey<ApiClient> = Symbol("ApiClient");*/

// src/plugins/api.ts
import { ApiClient, ApiClientBuilder } from '@git-dash/core'
import type { InjectionKey } from 'vue'
import { appLogger } from './logger.ts'
import { BACKEND_URL } from '@/config'   // ⬅️ IMPORTA daqui

const baseUrl = BACKEND_URL   // ⬅️ usa sempre o BACKEND_URL

// (opcional) só para avisar se a env não está definida, mas já sem partir a app
if (!import.meta.env.VITE_BACKEND_URL) {
  console.warn(
    'VITE_BACKEND_URL is not defined. Using default BACKEND_URL from config.ts:',
    baseUrl
  )
}

export const apiClient = ApiClientBuilder.create(baseUrl)
  .withClientName('Main-Backend-Client')
  .withLogger(appLogger)
  .withCredentials(true) // Required for cookie/session management
  .withTimeout(200000)   // adjust later
  .withRetryPolicy(3)
  .build()

export const ApiClientKey: InjectionKey<ApiClient> = Symbol('ApiClient')


