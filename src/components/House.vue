<template>
    <v-container>
        <v-layout justify-center align-center>
            <v-flex xs12 sm6>
                <transition appear enter-active-class="animated fadeInDown" leave-active-class="animated fadeOutUp">
                <v-card class="text-xs-center elevation-6">
                    <v-card-media
                        height="240px"
                        :src="houseCardImage()">
                    </v-card-media>
                    <v-card-title primary-title class="justify-center">
                        <h3 class="headline mb-0">{{ houseData.displayName }}</h3>
                        <div>#{{ id }}</div>
                    </v-card-title>
                    <v-card-text>
                        <div>{{ houseData.address.address }}</div>
                        <div>{{ houseData.address.city}}, {{houseData.address.state}} {{houseData.address.postalCode}}</div>
                        <div><a :href="'tel:'+houseData.phone">{{ houseData.phone }}</a></div>
                        <div>{{ getHouseHoursDesc(houseData) }}</div>
                        <div><span>Mon - Sun</span><span class="span-pipe">|</span><span>{{ getHouseHoursDesc(houseData) }}</span></div>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn flat color="info" :to="{name: 'Home'}">Go back</v-btn>
                    </v-card-actions>
                </v-card>
                </transition>
            </v-flex>
        </v-layout>
    </v-container>
</template>
<script>
import moment from 'moment'
export default {
    props: ['id'],
    data () {
        return {
            message: 'Welcome to the house details'
        }
    },
    computed: {
        houseData () {
            return this.$house.getters.getHouseById(this.id)
        }
    },
    methods: {
        getHouseHoursDesc (house) {
            if (house.operationalHours.open24Hours) {
                return 'Open 24 hours'
            } else if (house.operationalHours.todayHrs) {
                return 'Open until: ' + moment(house.operationalHours.todayHrs.endHr, 'hh:mm').format('hh:mm a')
            } else if (house.operationalHours.monToFriHrs) {
                return 'Open until: ' + moment(house.operationalHours.monToFriHrs.endHr, 'hh:mm').format('hh:mm a')
            } else {
                return '(call for lease hours)'
            }
        },
        getTimeStamp () {
            return moment().format('X')
        },
        HouseCardImage () {
            let allImages = this.$house.getters.houseCardImages
            if (allImages.length) {
                const index = Math.floor(Math.random() * allImages.length)
                return allImages[index].imgix_url
            } else {
                // TODO: add local static image url here.
                return ''
            }
        }
    }
}
</script>
<style>
.span-pipe {
    padding-left: 10px;
    padding-right: 10px;
}
</style>