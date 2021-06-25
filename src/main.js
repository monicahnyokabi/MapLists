import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import VueGoogleMaps from 'vue-googlemaps'
import 'vue-googlemaps/dist/vue-googlemaps.css'
import App from './App'
import router from './router'
import store from './store'

Vue.use(Vuetify)

Vue.use(VueGoogleMaps, {
    load: {
        // put your google API key either in the ./config/local.env.js file or just hardcode in the string below
        apiKey: process.env.GOOGLE_API_KEY || 'AIzaSyAZWDE-DwBfIET7HWc4o-w0T2T0PtkEgMc',
        libraries: ['places'],
        useBetaRenderer: false
    }
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>',
    created () {
        this.$house.dispatch('fetchMapIcons')
        this.$house.dispatch('fetchCities')
        this.$house.dispatch('fetchHouseCardImages')
    }
})