import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../views/Login.vue'
import AuthRoot from '../views/AuthRoot.vue'
import Library from '../views/Library.vue'
import Category from '../views/Category.vue'
import BlindTest from '../views/BlindTest.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'AuthRoot',
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
        path: '/playlists/:playlistId',
        name: 'BlindTest',
        component: BlindTest,
        props: true
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
