<script setup lang="ts">
import SpotifyArtist from '../Spotify/SpotifyArtist/SpotifyArtist.vue';
import SpotifyButton from '../Spotify/SpotifyButton/SpotifyButton.vue';
import { useArtistsStore } from '../../stores/Spotify/Artists';
import { onMounted } from 'vue';
import SpotifyLoader from '../Spotify/SpotifyLoader/SpotifyLoader.vue';
import SpotifySpinner from '../Spotify/SpotifySpinner/SpotifySpinner.vue';

const artistsStore = useArtistsStore();

onMounted(async () => {
    artistsStore.setLoading(true);
    await artistsStore.initialize();
    artistsStore.setLoading(false);
});
</script>

<template>
    <div class="artists-page-wrapper">
        <div v-if="artistsStore.loading">
            <SpotifyLoader />
        </div>
        <div class="main" v-if="!artistsStore.loading">
            <div class="header">
                <h1>Your Top Artists</h1>
                <div class="filters">
                    <SpotifyButton
                        variant="text"
                        :active="artistsStore.filter === 'long_term'"
                        @click="
                            async () =>
                                await artistsStore.setFilter('long_term')
                        "
                    >
                        All Time
                    </SpotifyButton>
                    <SpotifyButton
                        variant="text"
                        :active="artistsStore.filter === 'medium_term'"
                        @click="
                            async () =>
                                await artistsStore.setFilter('medium_term')
                        "
                    >
                        6 Months
                    </SpotifyButton>
                    <SpotifyButton
                        variant="text"
                        :active="artistsStore.filter === 'short_term'"
                        @click="
                            async () =>
                                await artistsStore.setFilter('short_term')
                        "
                    >
                        4 Weeks
                    </SpotifyButton>
                </div>
            </div>
            <div v-if="artistsStore.filterLoading" class="loader">
                <SpotifySpinner />
            </div>
            <SpotifyArtist
                v-for="(artist, index) in artistsStore.artists"
                :index="index + 1"
                :artist="artist"
                :key="index"
                v-else
            />
        </div>
    </div>
</template>

<style scoped lang="scss">
@import './ArtistsPage.scss';
</style>
