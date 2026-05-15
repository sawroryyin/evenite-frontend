import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EventCreateOptionsView from '../views/EventCreateOptionsView.vue'
import EventCreatePromptView from '../views/EventCreatePromptView.vue'
import EventCreateImageView from '../views/EventCreateImageView.vue'
import SavedEventsView from '../views/SavedEventsView.vue'
import PublishedEventsView from '../views/PublishedEventsView.vue'
import ProfileView from '../views/ProfileView.vue'
import EventDetailView from '../views/EventDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, },
    { path: '/create', name: 'create-options', component: EventCreateOptionsView },
    { path: '/create/prompt', name: 'create-prompt', component: EventCreatePromptView },
    { path: '/create/image', name: 'create-image', component: EventCreateImageView },
    { path: '/create/manual', name: 'create-manual', component: EventDetailView},
    { path: '/event/:id', name: 'event-detail', component: EventDetailView },
    { path: '/profile/edit', name: 'edit-profile', component: ProfileView }, 
    { path: '/profile/drafts', name: 'draft-events', component: SavedEventsView },
    { path: '/profile/published', name: 'published-events', component: PublishedEventsView }
  ]
})

export default router