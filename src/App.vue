<template>
    <div id="app">
        <v-app id="app">
            <v-toolbar color="indigo darken-1" dark fixed app>
                <v-icon>location_on</v-icon>
                <v-toolbar-title>Alpha-rental houses</v-toolbar-title>
            </v-toolbar>
            <v-content>
                <router-view></router-view>
            </v-content>
            <v-footer color="indigo lighten-1" app inset>
                <span class="white--text">&copy; rental houses assesment</span>
                <v-spacer></v-spacer>
                <span class="white--text">Attributions: <a class="white--text" href="https://icons8.com/icon/Zyo5wDjgJxRW/red-circle">Red Circle icon by Icons8</a></span>
            </v-footer>
        </v-app>
    </div>
</template>

<script>
export default {
    name: 'App'
}
</script>

<style>
html,
body,
#app {
    height: 100%;
}
</style>

