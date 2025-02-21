<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useSpotifyStore } from '../../stores/Spotify';
import SpotifyButton from '../Spotify/SpotifyButton/SpotifyButton.vue';
import { usePlaybackStore } from '../../stores/Spotify/Playback';
import { XMarkIcon } from '@heroicons/vue/24/solid';
import { endUser, privacy } from './docs';
const spotifyStore = useSpotifyStore();
const playbackStore = usePlaybackStore();

const showModal = ref('');

onMounted(async () => {
    spotifyStore.setLoading(true);
    await spotifyStore.initialize();
    await playbackStore.initialize();
    spotifyStore.setLoading(false);
});
</script>

<template>
    <div class="login-wrapper">
        <div class="overlay" v-if="showModal">
            <div class="end-user-modal">
                <div class="header">
                    <XMarkIcon class="icon" @click="() => (showModal = '')" />
                </div>
                <div class="text" v-if="showModal === 'end-user'">
                    {{ endUser }}
                </div>
                <div class="text" v-if="showModal === 'privacy'">
                    {{ privacy }}
                </div>
            </div>
        </div>
        <div class="login">
            <div class="title">TuneSphere</div>
            <div class="subtitle">
                Welcome to your Spotify profile stats and song recommendation
                tool
            </div>
            <SpotifyButton
                variant="primary"
                size="md"
                @click="spotifyStore.login"
            >
                <img
                    width="20"
                    src="/assets/spotify-logo-white.svg"
                    alt="Spotify"
                />
                Continue with Spotify
            </SpotifyButton>
            <div class="subtext">
                By continuing, you agree to our
                <span @click="() => (showModal = 'privacy')">
                    Privacy Policy
                </span>
                and
                <span @click="() => (showModal = 'end-user')">
                    End-User Agreement
                </span>
            </div>
        </div>
        <div class="image">
            <img src="/assets/background.jpeg" alt="Login" />
        </div>
    </div>
</template>

<style scoped lang="scss">
@import './LoginPage.scss';
</style>
