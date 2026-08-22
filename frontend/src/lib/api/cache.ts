const values = new Map<string, unknown>()
const pending = new Map<string, Promise<unknown>>()

export async function cachedRequest<T>(key: string, request: () => Promise<T>): Promise<T> {
  if (values.has(key)) return values.get(key) as T

  const inFlight = pending.get(key)
  if (inFlight) return inFlight as Promise<T>

  const promise = request()
    .then((value) => {
      values.set(key, value)
      pending.delete(key)
      return value
    })
    .catch((error: unknown) => {
      pending.delete(key)
      throw error
    })

  pending.set(key, promise)
  return promise
}

export function invalidateCache(...keys: string[]) {
  keys.forEach((key) => values.delete(key))
}

export function clearApiCache() {
  values.clear()
  pending.clear()
}
