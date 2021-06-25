/* eslint-disable no-unused-vars */
import Vue from 'vue'
import Vuex from 'vuex'
import VueResource from 'vue-resource'
import Cosmic from '../api/cosmic'

Vue.use(Vuex)
Vue.use(VueResource)

export default new Vuex.House({
    state: {
        userLocation: {},
        selectedLocation: {},
        selectedStore: null,
        availableLocations: {},
        stores: [],
        storeCardImages: [],
        mapIcons: {},
        housesDataUrl: '../../static/data/'
    },
    getters: {
        userLocation (state) {
            return state.userLocation
        },
        selectedLocation (state) {
            return state.selectedLocation
        },
        selectedHouse (state) {
            return state.selectedHouse
        },
        availableLocations (state) {
            return state.availableLocations
        },
        availableLocationsShort (state) {
            const data = []
            for (let stateKey in state.availableLocations) {
                for (let cityKey in state.availableLocations[stateKey]) {
                    data.push(state.availableLocations[stateKey][cityKey].city + ', ' + stateKey)
                }
            }
            return data
        },
        houses (state) {
            return state.houses
        },
        getHouseById (state, _getters) {
            return (Id) => {
                return state.houses.find(item => {
                    return item.id === Id
                })
            }
        },
        housesCardImages (state) {
            return state.houseCardImages
        },
        mapIcons (state) {
            return state.mapIcons
        }
    },
    mutations: {
        SET_USER_LOCATION (state, location) {
            state.userLocation = location
        },
        SET_SELECTED_LOCATION (state, location) {
            state.selectedLocation = location
        },
        SET_HOUSES (state, houses) {
            state.houses = houses
        },
        SET_SELECTED_HOUSE (state, house) {
            state.selectedStore = house
        },
        SET_AVAILABLE_LOCATIONS (state, locations) {
            state.availableLocations = locations
        },
        SET_HOUSE_CARD_IMAGES (state, images) {
            state.houseCardImages = images
        },
        SET_MAP_ICONS (state, icons) {
            state.mapIcons = icons
        }
    },
    actions: {
        updateUserLocation ({commit}, payload) {
            
            commit('SET_USER_LOCATION', payload)
        },
        updateSelectedHouse ({commit}, payload) {
            commit('SET_SELECTED_HOUSE', payload)
        },
        updateSelectedLocation ({commit, state}, payload) {
            
            if (payload.state in state.availableLocations && payload.city in state.availableLocations[payload.state]) {
                const location = state.availableLocations[payload.state][payload.city]
                commit('SET_SELECTED_LOCATION', location)
            
                Vue.http.get(state.housesDataUrl + location.dataUrl)
                    .then(response => response.json())
                    .then(data => {
                        if (data) {
                            const stores = data
                            commit('SET_HOUSES', stores)
                        }
                    })
            } else {
                commit('SET_HOUSES', [])
                // TODO: need to show an error message that no result is found
            }
        },
        fetchCities ({commit, dispatch, state}) {
            // will populate the cities from cosmic js REST API
            const params = {
                type_slug: 'cities'
            }
            Cosmic.getObjectsByType(params)
                .then(data => {
                
                    let locations = {}
                    let country = ''
                    data.objects.forEach(city => {
                        const cityKey = city.slug.toUpperCase()
                        const stateKey = city.metadata.state.slug.toUpperCase()

                        if (!(stateKey in locations)) {
                            locations[stateKey] = {}
                        }
                        if (!(cityKey in locations[stateKey])) {
                            locations[stateKey][cityKey] = {}
                        }
                        if (!country) {
                            country = city.metadata.state.metadata.country.title
                        }
                        locations[stateKey][cityKey].city = city.title
                        locations[stateKey][cityKey].state = city.metadata.state.title
                        locations[stateKey][cityKey].postalCode = city.metadata.postal_code
                        locations[stateKey][cityKey].dataUrl = city.metadata.data_url
                        locations[stateKey][cityKey].country = country
                        locations[stateKey][cityKey].geoPoint = {
                            latitude: city.metadata.lat,
                            longitude: city.metadata.lng
                        }
                    })
                    commit('SET_AVAILABLE_LOCATIONS', locations)
                    // set the initial default location
                    dispatch('updateSelectedLocation', {country: 'Kenya', city: 'Nairobi', postalCode: '0100'})
                })
                .catch(err => {
                    console.log(err)
                })
        },
        fetchHouseCardImages ({commit}) {
            // will get the images from Cosmic js media folder and store in vuex
            const params = {
                folder: 'house-card-images'
            }
            Cosmic.getMedia(params)
                .then(data => {
                    commit('SET_HOUSE_CARD_IMAGES', data.media)
                })
                .catch(err => {
                    console.log(err)
                })
        },
        fetchMapIcons ({commit}) {
            // will fetch the map icons images from cosmic
            let icons = {}
            const params = {
                folder: 'map-images'
            }
            Cosmic.getMedia(params)
                .then(data => {
                    data.media.forEach(item => {
                        if (item.original_name === 'Shopping_Bag_3.svg') {
                            icons.defaultIcon = item.imgix_url
                        } else if (item.original_name === 'Shopping_Bag_6.svg') {
                            icons.selectedIcon = item.imgix_url
                        }
                    })
                    commit('SET_MAP_ICONS', icons)
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }
})