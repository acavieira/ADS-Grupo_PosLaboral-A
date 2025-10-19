//THIS IS AN EXAMPLE APICLIENT PASTED TO TEST HOW PACKAGES WORK
//IT'S NOT TESTED PROPERLY, CHECK BEFORE USING


export type ApiClientOptions = {
  baseUrl: string
  headers?: Record<string, string>
}


export function createApiClient({ baseUrl, headers = {} }: ApiClientOptions) {
  const merge = (h?: Record<string, string>) => ({ ...headers, ...(h || {}) })


  async function get<T>(path: string, h?: Record<string, string>) {
    const res = await fetch(new URL(path, baseUrl), { headers: merge(h) })
    if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`)
    return (await res.json()) as T
  }


  async function post<T, B = unknown>(path: string, body: B, h?: Record<string, string>) {
    const res = await fetch(new URL(path, baseUrl), {
      method: 'POST',
      headers: merge({ 'Content-Type': 'application/json', ...h }),
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`POST ${path} -> ${res.status}`)
    return (await res.json()) as T
  }


  return { get, post }
}


