export const ACCESS_TOKEN_KEY = 'tripwise-access-token'
export const DEMO_SESSION_KEY = 'tripwise-demo-session'
export const DEMO_STATE_KEY = 'tripwise-demo-state-v1'

function getStorage() {
  return typeof window === 'undefined' ? null : window.localStorage
}

export function getAccessToken() {
  return getStorage()?.getItem(ACCESS_TOKEN_KEY) || null
}

export function setAccessToken(token: string) {
  getStorage()?.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken() {
  getStorage()?.removeItem(ACCESS_TOKEN_KEY)
}

export function hasDemoSession() {
  return getStorage()?.getItem(DEMO_SESSION_KEY) === 'true'
}

export function setDemoSession(enabled: boolean) {
  if (enabled) getStorage()?.setItem(DEMO_SESSION_KEY, 'true')
  else getStorage()?.removeItem(DEMO_SESSION_KEY)
}

export function clearDemoState() {
  getStorage()?.removeItem(DEMO_STATE_KEY)
}
