import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EventCreateOptionsView from '../views/EventCreateOptionsView.vue'
import EventCreatePromptView from '../views/EventCreatePromptView.vue'
import EventCreateImageView from '../views/EventCreateImageView.vue'
import EventCreateManualView from '../views/EventCreateManualView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, },
    { path: '/create', name: 'create-options', component: EventCreateOptionsView },
    { path: '/create/prompt', name: 'create-prompt', component: EventCreatePromptView },
    { path: '/create/image', name: 'create-image', component: EventCreateImageView },
    { path: '/create/manual', name: 'create-manual', component: EventCreateManualView }
  ]
})

export default router