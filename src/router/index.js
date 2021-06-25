import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import House from '@/components/House'

Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home
        },
        {
            path: '/house/:id',
            name: 'House',
            component: House,
            props: true
        }
    ]
})