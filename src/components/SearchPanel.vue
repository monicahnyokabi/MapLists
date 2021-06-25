<template>
    <v-card color="cyan accent-4" class="elevation-8 fill-height">
        <v-container fluid grid-list-lg>
            <v-layout row wrap>

                <v-flex xs1>
                    <v-icon class="recenter-map-icon" title="Recenter map location" @click="onRecenterMapLocation">my_location</v-icon>
                </v-flex>
                <v-flex xs10 offset-xs1>
                    <div class="subheading" v-show="!isSelectedLocationEdited">
                        <span>Your location:</span>
                        <a @click="onEditSelectedLocation"
                            href="#" class="white--text">{{ selectedLocation }}</a>
                    </div>
                    <div class="subheading location-edit" v-show="isSelectedLocationEdited">
                        <v-combobox label="Select a location"
                            ref="locationCombobox"
                            v-model="selectedLocation"
                            :items="availableLocations"
                            @change="onLocationChange"
                            @blur.self="onLocationBlur"
                            @input="onLocationBlur"
                            class="inline-input">
                        </v-combobox>
                    </div>
                </v-flex>

                <v-flex xs12 class="houses-list">
                    <div class="subheading">Rental Houses  ({{ housesCount }})</div>
                    <v-container fluid class="houses-list-container">
                        <v-layout row wrap>
                            <template v-for="house in houses">

                                <v-flex xs12 :key="'house-card-' + house.id"
                                    class="house-container" @mouseover="hoveredOnHouse=house.id" @mouseleave="hoveredOnHouse=null" :class="[(hoveredOnStore===house.id && selectedHouse!==house.id)? 'animated pulse store-hovered-on': '']">
                                    <v-card class="house-item-card"
                                        :class="{isSelected: selectedHouse === house.id}"
                                        @click.capture="onHouseClick(house.id)">
                                        <v-card-text>
                                            <router-link :to="{name: 'House', params: {id: house.id}}">
                                                <div class="subheading font-weight-medium">{{ house.displayName}}</div>
                                            </router-link>
                                            <div>{{ house.address.address}}</div>
                                            <div>{{ house.address.city}}, {{house.address.state}} {{house.address.postalCode}}</div>
                                            <div>
                                                <span><a :href="'tel:'+house.phone">{{ house.phone }}</a></span>
                                                <span class="house-hours">{{ getHouseHoursDesc(house) }}</span>
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-flex>

                            </template>
                        </v-layout>
                    </v-container>
                </v-flex>
            </v-layout>
        </v-container>
    </v-card>
</template>
<script>
import {mapActions} from 'vuex'
import moment from 'moment'
import EventBus from '../eventBus'
export default {
    data () {
        return {
            isSelectedLocationEdited: false,
            editedLocation: null,
            ignoreScrollToSelectedHouse: false,
            hoveredOnHouse: null
        }
    },
    props: {
        userLocation: { type: Object, default: () => { return {country: 'Kenya', city: 'Nairobi', postalCode: '0100'} } }
    },
    computed: {
        selectedLocation: {
            get () {
                const location = this.$houses.getters.selectedLocation
                return location.city + ', ' + location.state
            },
            set (newValue) {
                
                this.editedLocation = newValue
            }
        },
        fullSelectedLocation () {
            return this.$house.getters.selectedLocation
        },
        selectedStore: {
            get () {
                return this.$house.getters.selectedHouse
            },
            set (value) {
                this.updateSelectedHouse(value)
            }
        },
        availableLocations () {
            return this.$house.getters.availableLocationsShort
        },
        houses () {
            return this.$houses.getters.houses
        },
        housesCount () {
            return this.houses.length
        }
    },
    watch: {
        // eslint-disable-next-line no-unused-vars
        selectedHouse (newValue, oldValue) {
            // need to wait until the selected store class changes
            if (this.ignoreScrollToSelectedHouse) {
                this.ignoreScrollToSelectedHouse = false
            } else {
                // triger the auto scroll only if the selection is triggered from outside the list
                setTimeout(() => {
                    this.scrollToSelectedHouse()
                }, 50)
            }
        }
    },
    methods: {
        ...mapActions(['updateSelectedLocation', 'updateSelectedHouse']),
        // -------------------
        // events
        // -------------------
        onEditSelectedLocation () {
            this.isSelectedLocationEdited = !this.isSelectedLocationEdited
            setTimeout(() => {
                this.$refs.locationCombobox.focus()
            }, 100)
        },
        onHouseClick (houseId) {
            this.ignoreScrollToSelectedHouse = true
            this.selectedHouse = houseId
        },
        onRecenterMapLocation () {
            // need to emit the event to parent component
            // we can either use the event bus
            // or we can use vuex
            EventBus.recenterMapLocation()
        },
        onLocationChange () {
            if (this.editedLocation) {
                const location = this.editedLocation.split(', ')
                this.updateSelectedLocation({state: location[1], city: location[0].toUpperCase(), postalCode: ''})
                this.resetComponentData()
            }
        },
        onLocationBlur () {
            // clear the combobox edit mode if no changes.
            if (this.isSelectedLocationEdited && !this.editedLocation) {
                this.editedLocation = null
                this.isSelectedLocationEdited = false
            }
        },
        // -------------------
        // other methods
        // -------------------
        getHouseHoursDesc (house) {
            if (house.operationalHours.open24Hours) {
                return 'Open 24 hours'
            } else if (house.operationalHours.todayHrs) {
                return 'Open until: ' + moment(house.operationalHours.todayHrs.endHr, 'hh:mm').format('hh:mm a')
            } else if (house.operationalHours.monToFriHrs) {
                return 'Open until: ' + moment(house.operationalHours.monToFriHrs.endHr, 'hh:mm').format('hh:mm a')
            } else {
                return '(call for leasing hours)'
            }
        },
        scrollToSelectedHouse () {
            // scroll to the selected house
            const housesList = this.$el.querySelector('.container.houses-list-container')
            const selectedHouse = this.$el.querySelector('.house-item-card.v-card.isSelected')
            if (housesList && selectedHouse) {
                housesList.scrollTop = selectedHouse.offsetTop - selectedHouse.offsetHeight
            }
        },
        scrollToSHousesListTop () {
            const housesList = this.$el.querySelector('.container.houses-list-container')
            if (housesList) {
                housesList.scrollTop = 0
            }
        },
        resetComponentData () {
            this.editedLocation = null
            this.isSelectedLocationEdited = false
            this.selectedHouse = null
            this.ignoreScrollToSelectedHouse = false
            this.scrollToHousesListTop()
        }
    }
}
</script>
<style>
.location-edit .inline-input {
    display: inline-flex;
    width: 70%;
}
.location-edit .inline-button {
    margin-left: 0;
    margin-right: 0;
}
.houses-list-container {
    padding-left: 0;
    padding-right: 0;
    height: 60vh;
    overflow: auto;
    padding-top: 10px;
}

.house-container.house-hovered-on .house-item-card {
    outline: 5px solid #9FA8DA;
    background-color: #BBDEFB;
}
.house-hours {
    padding-left: 20px;
}
.house-item-card {
    cursor: pointer;
}
.house-item-card.isSelected {
    border: 4px solid #5C6BC0;
    background-color: #BBDEFB;
}
.recenter-map-icon {
    cursor: pointer;
}
</style>