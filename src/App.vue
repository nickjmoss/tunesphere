<script setup lang="ts">
import { RouterView } from 'vue-router';
import {
    BoltIcon,
    HomeIcon,
    SparklesIcon,
    MusicalNoteIcon,
    MicrophoneIcon,
    ListBulletIcon,
} from '@heroicons/vue/24/solid';
import LoginPage from './components/LoginPage/LoginPage.vue';
import { useSpotifyStore } from './stores/Spotify';
import SpotifyButton from './components/Spotify/SpotifyButton/SpotifyButton.vue';
const spotifyStore = useSpotifyStore();
</script>

<template>
    <div v-if="spotifyStore.accessToken" class="main-wrapper">
        <div class="menu-bar">
            <div class="logo" @click="$router.push('/')">
                <BoltIcon style="width: 30px" />
                <span>TuneSphere</span>
            </div>
            <SpotifyButton variant="outlined" @click="spotifyStore.logout">
                Logout
            </SpotifyButton>
        </div>
        <RouterView />
        <div class="fixed-menu">
            <div class="menu-button" @click="$router.push('/')">
                <HomeIcon
                    class="icon"
                    :class="{ active: $route.name === 'home' }"
                />
                <div class="name" :class="{ active: $route.name === 'home' }">
                    Home
                </div>
            </div>
            <div class="divider"></div>
            <div class="menu-button" @click="$router.push('/tracks')">
                <MusicalNoteIcon
                    class="icon"
                    :class="{ active: $route.name === 'tracks' }"
                />
                <div class="name" :class="{ active: $route.name === 'tracks' }">
                    Tracks
                </div>
            </div>
            <div class="for-you-button-wrapper">
                <div class="for-you-button" @click="$router.push('/for-you')">
                    <SparklesIcon
                        class="for-you-icon"
                        :class="{ 'active-for-you': $route.name === 'for-you' }"
                    />
                </div>
            </div>
            <div class="menu-button" @click="$router.push('/artists')">
                <MicrophoneIcon
                    class="icon"
                    :class="{ active: $route.name === 'artists' }"
                />
                <div
                    class="name"
                    :class="{ active: $route.name === 'artists' }"
                >
                    Artists
                </div>
            </div>
            <div class="divider"></div>
            <div class="menu-button" @click="$router.push('/playlists')">
                <ListBulletIcon
                    class="icon"
                    :class="{
                        active:
                            $route.name === 'playlists' ||
                            $route.name === 'playlist-details',
                    }"
                />
                <div
                    class="name"
                    :class="{
                        active:
                            $route.name === 'playlists' ||
                            $route.name === 'playlist-details',
                    }"
                >
                    Playlists
                </div>
            </div>
        </div>
    </div>
    <LoginPage v-else />
</template>

<style scoped lang="scss">
@import './App.scss';
</style>
