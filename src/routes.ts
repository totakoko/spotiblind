import Login from './views/Login.vue'
import AuthenticatedLayout from './views/AuthenticatedLayout.vue'
import Library from './views/Library.vue'
import Category from './views/Category.vue'
import BlindTest from './views/BlindTest.vue'
import Settings from './views/Settings.vue'
import About from './views/About.vue'
import NotFound from './views/NotFound.vue'
import Debug from './views/Debug.vue'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const devMode = import.meta.env.DEV

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  ...(devMode
    ? [{
        path: '/debug',
        name: 'Debug',
        component: Debug
      }
      ]
    : []),
  {
    path: '/',
    component: AuthenticatedLayout,
    children: [
      {
        path: '/',
        name: 'Categories',
        component: Library
      },
      {
        path: '/categories/:categoryId',
        name: 'Category',
        component: Category,
        props: true
      },
      {
        path: '/categories/:categoryId/playlists/:playlistId',
        name: 'CategoryBlindTest',
        component: BlindTest,
        props: true
      },
      {
        path: '/playlists/:playlistId',
        name: 'PlaylistBlindTest',
        component: BlindTest,
        props: true
      },
      {
        path: '/settings',
        name: 'Settings',
        component: Settings
      },
      {
        path: '/about',
        name: 'About',
        component: About
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
