<script setup lang="ts">
import { onMounted } from 'vue';
import { useSpotifyStore } from '../../stores/Spotify';
import SpotifyButton from '../Spotify/SpotifyButton/SpotifyButton.vue';
import { usePlaybackStore } from '../../stores/Spotify/Playback';
const spotifyStore = useSpotifyStore();
const playbackStore = usePlaybackStore();

onMounted(async () => {
    spotifyStore.setLoading(true);
    await spotifyStore.initialize();
    await playbackStore.initialize();
    spotifyStore.setLoading(false);
});
</script>

<template>
    <div class="login-wrapper">
        <div class="welcome-wrapper">
            <h1 class="title">Welcome to TuneSphere</h1>
            <p class="description">
                TuneSphere is a one stop shop Spotify profile stats and
                recommendations app. Login with your Spotify account to get
                started.
            </p>
        </div>
        <SpotifyButton variant="primary" size="lg" @click="spotifyStore.login">
            Continue with Spotify
        </SpotifyButton>
    </div>
</template>

<style scoped lang="scss">
@import './LoginPage.scss';
</style>
