import { createRouter, createWebHistory } from 'vue-router'


const routes = [
    {
        path: '/',
        name: '系统',
        component: () => import('../Index.vue')
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
