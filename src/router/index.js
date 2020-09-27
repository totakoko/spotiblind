import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../views/Login.vue'
import AuthRoot from '../views/AuthRoot.vue'
import Library from '../views/Library.vue'
import Category from '../views/Category.vue'
import BlindTest from '../views/BlindTest.vue'
import Settings from '../views/Settings.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: AuthRoot,
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
        name: 'BlindTest',
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

  // when the page is not found
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
