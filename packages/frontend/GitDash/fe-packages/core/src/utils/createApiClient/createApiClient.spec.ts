import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApiClient } from './createApiClient'


const BASE = 'https://api.example.com/'


describe('createApiClient', () => {
  const originalFetch = globalThis.fetch


  beforeEach(() => {
    globalThis.fetch = vi.fn() as any
  })
  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })


  it('GET returns parsed json and uses baseUrl', async () => {
    const payload = { ok: true }
    ;(globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => payload,
    })


    const api = createApiClient({ baseUrl: BASE })
    const res = await api.get<typeof payload>('health')


    expect(globalThis.fetch).toHaveBeenCalledWith(new URL('health', BASE), { headers: {} })
    expect(res).toEqual(payload)
  })


  it('POST sends JSON body & headers', async () => {
    const payload = { id: 1 }
    ;(globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => payload,
    })


    const api = createApiClient({ baseUrl: BASE, headers: { Authorization: 'Bearer X' } })
    const body = { name: 'Kate' }
    const res = await api.post<typeof payload, typeof body>('users', body)


    expect(globalThis.fetch).toHaveBeenCalled()
    const [, init] = (globalThis.fetch as any).mock.calls[0]
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(init.headers.Authorization).toBe('Bearer X')
    expect(JSON.parse(init.body as string)).toEqual(body)
    expect(res).toEqual(payload)
  })


  it('throws on non-ok response', async () => {
    ;(globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    })
    const api = createApiClient({ baseUrl: BASE })
    await expect(api.get('boom')).rejects.toThrow(/GET boom -> 500/)
  })
})
