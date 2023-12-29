import type { RouteRecordRaw } from 'vue-router'
import Login from './views/Login.vue'
import AuthenticatedLayout from './views/AuthenticatedLayout.vue'
import Library from './views/Library.vue'
import Category from './views/Category.vue'
import BlindTest from './views/BlindTest.vue'
import Settings from './views/Settings.vue'
import About from './views/About.vue'
import NotFound from './views/NotFound.vue'
import Debug from './views/Debug.vue'
import { SPOTIFY_CLIENT } from './injects'

const devMode = import.meta.env.DEV

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter(to) {
      const spotifyClient = inject(SPOTIFY_CLIENT)!
      // redirect if already logged in
      if (spotifyClient.isLoggedIn()) {
        return {
          path: typeof to.query.redirect === 'string' ? to.query.redirect : '/',
        }
      }
    },
  },
  ...(devMode
    ? [{
        path: '/debug',
        name: 'Debug',
        component: Debug,
      },
      ]
    : []),
  {
    path: '/',
    component: AuthenticatedLayout,
    beforeEnter(to) {
      const spotifyClient = inject(SPOTIFY_CLIENT)!
      // redirect if not logged in
      if (!spotifyClient.isLoggedIn()) {
        return {
          path: '/login',
          query: { redirect: to.fullPath },
        }
      }
    },
    children: [
      {
        path: '/',
        name: 'Categories',
        component: Library,
      },
      {
        path: '/categories/:categoryId',
        name: 'Category',
        component: Category,
        props: true,
      },
      {
        path: '/categories/:categoryId/playlists/:playlistId',
        name: 'CategoryBlindTest',
        component: BlindTest,
        props: true,
      },
      {
        path: '/playlists/:playlistId',
        name: 'PlaylistBlindTest',
        component: BlindTest,
        props: true,
      },
      {
        path: '/settings',
        name: 'Settings',
        component: Settings,
      },
      {
        path: '/about',
        name: 'About',
        component: About,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
  },
]
