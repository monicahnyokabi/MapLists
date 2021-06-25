<template>
    <div class="map-panel-container elevation-8 brown lighten-4">
        <googlemaps-map
            ref="map"
            class="map"
            :center.sync="mapCenter"
            :zoom.sync="zoom">

            <googlemaps-marker
                v-for="marker in mapMarkers"
                :key="marker.id"
                :title="marker.title"
                :animation="marker.animation"
                :icon="marker.icon"
                :position="marker.position"
                @click="onMapMarkerClick(marker.id)"
                @mouseover="onMapMarkerMouseOver(marker.id)"
                @mouseout="onMapMarkerMouseOut(marker.id)">
            </googlemaps-marker>

        </googlemaps-map>
    </div>
</template>
<script>
import {mapActions} from 'vuex'
import EventBus from '../eventBus'
export default {
    data () {
        return {
            mapCenter: {lat: 0.0236, lng: 37.9062},
            zoom: 11,
            mapMarkers: null,
            mapMarkerIconSize: null,
            ignoreCenterOnSelectedStore: false
        }
    },
    computed: {
        selectedLocation () {
            return this.$house.getters.selectedLocation
        },
        selectedStore: {
            get () {
                return this.$house.getters.selectedHouse
            },
            set (value) {
                this.updateSelectedStore(value)
            }
        },
        stores () {
            return this.$house.getters.stores
        },
        mapIcons () {
            return this.$house.getters.mapIcons
        }
    },
    watch: {
        selectedLocation () {
            this.updateMapCenter(this.selectedLocation)
        },
        selectedStore (newValue, oldValue) {
            this.selectMapMarker(oldValue, false)
            this.selectMapMarker(newValue, true)
        }
    },
    methods: {
        ...mapActions(['updateSelectedHouse']),
        // -------------------
        // events
        // -------------------
        onMapMarkerClick (id) {
            this.ignoreCenterOnSelectedHouse = true
            this.selectedStore = id
        },
        onMapMarkerMouseOver (id) {
            const marker = this.mapMarkers[id]
            marker.animation = 1
            setTimeout(() => {
                marker.animation = 4
            }, 300)
        },
        onMapMarkerMouseOut (id) {
            const marker = this.mapMarkers[id]
            marker.animation = 4
        },
        // -------------------
        // other methods
        // -------------------
        updateMapCenter (location) {
            // to update the map center we need some time delay, otherwise the change wouldn't work
            this.mapMarkers = null
            setTimeout(() => {
                this.mapCenter.lat = location.geoPoint.latitude
                this.mapCenter.lng = location.geoPoint.longitude
                this.zoom = 11
                this.addMapMarkers()
            }, 500)
        },
        addMapMarkers () {
            // go through the houses list and add a map marker for each
            let markers = {}
            for (let i = 0; i < this.houses.length; i++) {
                const marker = {}
                marker.id = this.houses[i].id
                marker.title = this.houses[i].displayName + '\n' + this.houses[i].address.address + '\n' +
                    this.houses[i].phone
                marker.animation = 4
                marker.position = {
                    lat: this.stores[i].geoPoint.latitude,
                    lng: this.stores[i].geoPoint.longitude
                }
                marker.icon = {url: this.mapIcons.defaultIcon, scaledSize: this.mapMarkerIconSize}
                markers[this.houses[i].id] = marker
            }
            this.mapMarkers = markers
        },
        centerOnHouse (location) {
            // will repositioned the map center to the specific location
            if (this.ignoreCenterOnSelectedHouse) {
                this.ignoreCenterOnSelectedHouse = false
            } else {
                if (location) {
                    this.mapCenter = location
                }
            }
        },
        recenterMapLocation () {
            // will recenter the map either to selected store if any
            // or the selected location if no store is selected
            if (this.selectedHouse && this.mapMarkers && this.mapMarkers[this.selectedHouse]) {
                this.centerOnHouse(this.mapMarkers[this.selectedHouse].position)
            } else if (this.selectedLocation) {
                // this.updateMapCenter(this.selectedLocation)
                const location = {
                    lat: this.selectedLocation.geoPoint.latitude,
                    lng: this.selectedLocation.geoPoint.longitude
                }
                this.centerOnHouse(location)
            }
        },
        selectMapMarker (id, isOn) {
            // will make the specified id marker either heilighted or not
            if (this.mapMarkers && this.mapMarkers[id]) {
                const url = isOn ? this.mapIcons.selectedIcon : this.mapIcons.defaultIcon
                const icon = {url: url, scaledSize: this.mapMarkerIconSize}
                this.mapMarkers[id].icon = icon
                if (isOn) {
                    const houseLocation = Object.assign({}, this.mapMarkers[id].position)
                    this.centerOnHouse(houseLocation)
                }
            }
        }
    },
    created () {
        EventBus.$on('recenterMapLocation', () => {
            this.recenterMapLocation()
        })
    },
    beforeMount () {
        if (this.selectedLocation.geoPoint) {
            this.updateMapCenter(this.selectedLocation)
        }
    },
    googleMapsReady () {
        this.mapMarkerIconSize = new window.google.maps.Size(40, 40)
    }
}
</script>
<style>
.map-panel-container {
    height: 100%;
}
.map {
    flex: 100% 1 1;
    height: 100%;
}
</style>