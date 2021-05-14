import Login from './views/Login.vue'
import AuthenticatedLayout from './views/AuthenticatedLayout.vue'
import Library from './views/Library.vue'
import Category from './views/Category.vue'
import BlindTest from './views/BlindTest.vue'
import Settings from './views/Settings.vue'
import NotFound from './views/NotFound.vue'

export const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
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
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound
  }
]
