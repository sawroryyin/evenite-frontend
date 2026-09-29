import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'

import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Back/forward can restore a frozen snapshot of a logged-in page without
// running the router guard. If the token is gone, send the user to login.
window.addEventListener('pageshow', (event) => {
  if (event.persisted && !localStorage.getItem('access_token')) {
    window.location.replace('/auth/login')
  }
})

// Logging out in one tab (or the installed PWA) logs out all other open tabs too
window.addEventListener('storage', (event) => {
  if (event.key === 'access_token' && !event.newValue) {
    window.location.replace('/auth/login')
  }
})