import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import HomeView from '../views/HomeView.vue'
import EventCreateOptionsView from '../views/event-creation/EventCreateOptionsView.vue'
import EventCreatePromptView from '../views/event-creation/EventCreatePromptView.vue'
import EventCreateImageView from '../views/event-creation/EventCreateImageView.vue'
import SavedEventsView from '../views/event/SavedEventsView.vue'
import PublishedEventsView from '../views/event/PublishedEventsView.vue'
import ProfileView from '../views/profile/ProfileView.vue'
import ProfileCreateView from '../views/profile/ProfileCreateView.vue'
import EventDetailView from '../views/event/EventDetailView.vue'
import EventListView from '../views/event/EventListView.vue'
import DiscussionView from '../views/DiscussionView.vue'
import NotificationView from '../views/NotificationView.vue'
import SearchView from '../views/SearchView.vue'
import RoleSelectView from '../views/auth/RoleSelectView.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import VerifyEmailView from '../views/auth/VerifyEmailView.vue'
import FormDetailView from '../views/form/FormDetailView.vue'
import FormResponseView from '../views/form/FormResponseView.vue'
import FormSubmitView from '../views/form/FormSubmitView.vue'
import MyTicketsView from '../views/ticket/TicketListView.vue'
import TicketDetailView from '../views/ticket/TicketDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/auth/login', name: 'login', component: LoginView, meta: { isGuest: true } },
    { path: '/auth/register', name: 'register', component: RegisterView, meta: { isGuest: true } },
    { path: '/verify-email', name: 'verify-email', component: VerifyEmailView, meta: { isPublic: true } },
    { path: '/login', redirect: '/auth/login' },
    { path: '/register', redirect: '/auth/register' },
    { path: '/auth/verify-email', redirect: (to) => ({ path: '/verify-email', query: to.query }) },

    { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
    { path: '/create', name: 'create-options', component: EventCreateOptionsView, meta: { requiresAuth: true } },
    { path: '/create/prompt', name: 'create-prompt', component: EventCreatePromptView, meta: { requiresAuth: true } },
    { path: '/create/image', name: 'create-image', component: EventCreateImageView, meta: { requiresAuth: true } },
    { path: '/create/manual', name: 'create-manual', component: EventDetailView, meta: { requiresAuth: true } },
    { path: '/event/:id', name: 'event-detail', component: EventDetailView, meta: { requiresAuth: true } },
    { path: '/event', name: 'event-list', component: EventListView, meta: { requiresAuth: true } },
    { path: '/discussion', name: 'discussion', component: DiscussionView, meta: { requiresAuth: true } },
    { path: '/notifications', name: 'notifications', component: NotificationView, meta: { requiresAuth: true } },
    { path: '/search', name: 'search', component: SearchView, meta: { requiresAuth: true } },

    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
    { path: '/profile/create', name: 'profile-create', component: ProfileCreateView, meta: { requiresAuth: true } },
    { path: '/profile/drafts', name: 'draft-events', component: SavedEventsView, meta: { requiresAuth: true } },
    { path: '/profile/published', name: 'published-events', component: PublishedEventsView, meta: { requiresAuth: true } },
    { path: '/role-select', name: 'role-select', component: RoleSelectView, meta: { requiresAuth: true } },

    { path: '/events/:id/forms/:formType', name: 'form-detail', component: FormDetailView, meta: { requiresAuth: true } },
    { path: '/events/:id/forms/:formType/responses', name: 'form-responses', component: FormResponseView, meta: { requiresAuth: true }},
    { path: '/events/:id/forms/:formType/submit', name: 'form-submit', component: FormSubmitView, meta: { requiresAuth: true } },

    { path: '/events/:id/register', name: 'event-register', redirect: to => `/events/${to.params.id}/forms/REGISTRATION/submit` },
    { path: '/my-tickets', name: 'my-tickets', component: MyTicketsView, meta: { requiresAuth: true } },
    { path: '/events/:eventId/tickets/:ticketId', name: 'ticket-detail', component: TicketDetailView, meta: { requiresAuth: true } },
  ],
  scrollBehavior() {
    return { top: 0 };
  }
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  } 
  
  if (to.meta.isGuest && isAuthenticated) {
    if (!authStore.currentRole) return { name: 'role-select' }
    if (authStore.currentRole === 'ORGANIZER') return { name: 'event-list' }
    return { name: 'home' }
  } 

  if (to.name === 'home' && authStore.currentRole === 'ORGANIZER') {
    return { name: 'event-list' }
  }
  
  if (isAuthenticated && to.meta.requiresAuth && to.name !== 'role-select' && to.name !== 'profile-create') {
    if (!authStore.currentRole) {
      return { name: 'role-select' }
    }
    if (authStore.currentRole === 'PARTICIPANT' && !authStore.hasParticipantProfile) {
      return { name: 'profile-create', query: { role: 'PARTICIPANT' } }
    }
    if (authStore.currentRole === 'ORGANIZER' && !authStore.hasOrganizerProfile) {
      return { name: 'profile-create', query: { role: 'ORGANIZER' } }
    }
  }
  return true
})

export default router