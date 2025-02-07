<script setup lang="ts">
import SpotifyTrack from '../Spotify/SpotifyTrack/SpotifyTrack.vue';
import SpotifyButton from '../Spotify/SpotifyButton/SpotifyButton.vue';
import SpotifyLoader from '../Spotify/SpotifyLoader/SpotifyLoader.vue';
import SpotifySpinner from '../Spotify/SpotifySpinner/SpotifySpinner.vue';
import { useTrackStore } from '../../stores/Spotify/Tracks';
import { onMounted } from 'vue';

const trackStore = useTrackStore();

onMounted(async () => {
    trackStore.setLoading(true);
    await trackStore.initialize();
    trackStore.setLoading(false);
});
</script>

<template>
    <div class="tracks-page-wrapper">
        <div v-if="trackStore.loading">
            <SpotifyLoader />
        </div>
        <div class="main" v-else>
            <div class="header">
                <h1>Your Top Tracks</h1>
                <div class="filters">
                    <SpotifyButton
                        variant="text"
                        :active="trackStore.filter === 'long_term'"
                        @click="
                            async () => await trackStore.setFilter('long_term')
                        "
                    >
                        All Time
                    </SpotifyButton>
                    <SpotifyButton
                        variant="text"
                        :active="trackStore.filter === 'medium_term'"
                        @click="
                            async () =>
                                await trackStore.setFilter('medium_term')
                        "
                    >
                        6 Months
                    </SpotifyButton>
                    <SpotifyButton
                        variant="text"
                        :active="trackStore.filter === 'short_term'"
                        @click="
                            async () => await trackStore.setFilter('short_term')
                        "
                    >
                        4 Weeks
                    </SpotifyButton>
                </div>
            </div>
            <div v-if="trackStore.filterLoading" class="loader">
                <SpotifySpinner />
            </div>
            <SpotifyTrack
                v-for="(track, index) in trackStore.tracks"
                :index="index + 1"
                :track="track"
                :key="index"
                v-else
            />
        </div>
    </div>
</template>

<style scoped lang="scss">
@import './TracksPage.scss';
</style>
