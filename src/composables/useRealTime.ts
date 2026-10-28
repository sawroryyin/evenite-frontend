import { onMounted, onBeforeUnmount } from 'vue'
import { io, type Socket } from 'socket.io-client'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

// One shared connection to the backend's `realtime` namespace.
// The server puts every socket into the user's personal channel, so clients only
// connect and listen — there is no room-join step.

// TODO: use the same token source as your discussion-room socket / axios interceptor
const getAccessToken = (): string => useAuthStore().accessToken ?? ''

// TODO: call your existing refresh logic (POST /auth/refresh with the refresh token)
// and store the new access token where getAccessToken() reads it.
const refreshAccessToken = async (): Promise<void> => {
  const authStore = useAuthStore()
  const response = await api.post('/auth/refresh')
  const newToken = response.data.accessToken
  if (newToken) authStore.setTokens(newToken, authStore.refreshToken!)
}

// sockets connect to the server origin; an `/api` prefix in baseURL does not apply to socket.io
const getSocketOrigin = (): string => {
  const base = (api.defaults.baseURL as string | undefined) || window.location.origin
  return new URL(base, window.location.origin).origin
}

const MAX_AUTH_RETRIES = 3

let socket: Socket | null = null
let users = 0
let retryTimer: ReturnType<typeof setTimeout> | null = null
let stableTimer: ReturnType<typeof setTimeout> | null = null
let authRetries = 0
let closeTimer: ReturnType<typeof setTimeout> | null = null

const acquireSocket = (): Socket => {
  users++
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
  if (socket) return socket

  socket = io(`${getSocketOrigin()}/realtime`, {
    auth: (cb) => cb({ token: getAccessToken() }),
    withCredentials: true,
    transports: ['websocket', 'polling']
  })

  // NestJS rejects in handleConnection, i.e. AFTER 'connect' fires,
  // so only treat the connection as authenticated if it survives a few seconds
  socket.on('connect', () => {
    if (stableTimer) clearTimeout(stableTimer)
    stableTimer = setTimeout(() => { authRetries = 0 }, 5000)
  })

  socket.on('disconnect', (reason) => {
    if (stableTimer) clearTimeout(stableTimer)
    if (reason !== 'io server disconnect' || users === 0) return
    if (authRetries >= MAX_AUTH_RETRIES) return // give up (e.g. logged out)
    authRetries++
    retryTimer = setTimeout(async () => {
      try { await refreshAccessToken() } catch { /* keep the old token */ }
      socket?.connect()
    }, 1000 * authRetries)
  })

  return socket
}

export const closeRealtime = () => {
  if (retryTimer) clearTimeout(retryTimer)
  if (stableTimer) clearTimeout(stableTimer)
  if (!socket) return
  socket.removeAllListeners()
  socket.disconnect()
  socket = null
  users = 0
}

const releaseSocket = () => {
  users = Math.max(users - 1, 0)
  if (users === 0) {
    // keep the socket briefly so the next page can reuse it
    closeTimer = setTimeout(() => { if (users === 0) closeRealtime() }, 3000)
  }
}

// call after your axios interceptor refreshes the access token,
// so the socket re-authenticates with the new one
export const reconnectRealtime = () => {
  if (!socket) return
  authRetries = 0
  socket.disconnect().connect()
}

type Handlers = Record<string, (data: any) => void>

/**
 * Listen to realtime messages while the component is mounted.
 * The server does not replay missed messages, so `onConnect` runs on EVERY
 * (re)connect and the page should refetch its data there.
 */
export function useRealtime(handlers: Handlers, onConnect?: () => void) {
  let s: Socket | null = null
  const handleConnect = () => onConnect?.()

  onMounted(() => {
    s = acquireSocket()
    s.on('connect', handleConnect)
    for (const [event, handler] of Object.entries(handlers)) s.on(event, handler)
  })

  onBeforeUnmount(() => {
    if (!s) return
    s.off('connect', handleConnect)
    for (const [event, handler] of Object.entries(handlers)) s.off(event, handler)
    releaseSocket()
    s = null
  })
}