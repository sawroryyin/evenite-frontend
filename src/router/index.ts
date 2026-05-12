import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EventCreateOptionsView from '../views/EventCreateOptionsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, },
    { path: '/create', name: 'create-options', component: EventCreateOptionsView }
  ]
})

export default router