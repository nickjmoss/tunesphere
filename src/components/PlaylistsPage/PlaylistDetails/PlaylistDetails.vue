<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { usePlaylistsStore } from '../../../stores/Spotify/Playlists';
import { useRoute } from 'vue-router';
import SpotifyTrack from '../../Spotify/SpotifyTrack/SpotifyTrack.vue';
import SpotifyLoader from '../../Spotify/SpotifyLoader/SpotifyLoader.vue';
import SpotifySpinner from '../../Spotify/SpotifySpinner/SpotifySpinner.vue';
import { Radar } from 'vue-chartjs';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
);

const tracks = ref<HTMLElement | null>(null);

const route = useRoute();

const playlistsStore = usePlaylistsStore();

const infiniteScroll = async () => {
    if (tracks.value) {
        const element = tracks.value;
        const lastTrack = element.lastElementChild;
        if (lastTrack) {
            const lastTrackPosition = lastTrack.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;
            if (lastTrackPosition < windowHeight) {
                await playlistsStore.loadMoreTracks();
            }
        }
    }
};

watch(tracks, () => {
    document.addEventListener('scroll', infiniteScroll);
});

onMounted(async () => {
    playlistsStore.setPlaylistDetailsLoading(true);
    await playlistsStore.initializeDetails(route.params?.id as string);
    playlistsStore.setPlaylistDetailsLoading(false);
});

onUnmounted(() => {
    document.removeEventListener('scroll', infiniteScroll);
});
</script>

<template>
    <div>
        <div v-if="playlistsStore.playlistDetailsLoading">
            <SpotifyLoader />
        </div>
        <div
            class="playlist-details-wrapper"
            v-if="
                playlistsStore.playlistDetails.id &&
                !playlistsStore.playlistDetailsLoading
            "
        >
            <div class="playlist-details">
                <div class="playlist-details-header">
                    <div class="playlist-details-image">
                        <img
                            :src="
                                playlistsStore.playlistDetails?.images?.[0]?.url
                                    ? playlistsStore.playlistDetails.images[0]
                                          .url
                                    : 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Spotify_App_Logo.svg/240px-Spotify_App_Logo.svg.png'
                            "
                        />
                    </div>
                    <div class="playlist-details-info">
                        <div class="playlist-details-name">
                            {{ playlistsStore.playlistDetails.name }}
                        </div>
                        <div
                            class="playlist-details-description"
                            v-if="playlistsStore.playlistDetails.description"
                        >
                            {{ playlistsStore.playlistDetails.description }}
                        </div>
                        <div class="playlist-details-owner">
                            <span>By </span>
                            <span v-if="playlistsStore.playlistDetails.owner">
                                {{
                                    playlistsStore.playlistDetails.owner
                                        .display_name
                                }}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="radar-chart">
                    <div class="title">Playlist Stats</div>
                    <div class="chart">
                        <Radar
                            :data="{
                                labels: [
                                    'acousticness',
                                    'danceability',
                                    'energy',
                                    'instrumentalness',
                                    'speechiness',
                                    'liveness',
                                    'valence',
                                ],
                                datasets: [
                                    {
                                        data: playlistsStore.getAudioMetrics,
                                        backgroundColor:
                                            'rgba(29, 185, 84, 0.2)',
                                        borderColor: 'rgba(29, 185, 84)',
                                        pointBackgroundColor:
                                            'rgba(29, 185, 84)',
                                        pointBorderColor: 'rgba(29, 185, 84)',
                                        pointHoverBackgroundColor:
                                            'rgba(29, 185, 84)',
                                        pointHoverBorderColor:
                                            'rgba(29, 185, 84)',
                                    },
                                ],
                            }"
                            :options="{
                                scales: {
                                    r: {
                                        ticks: {
                                            display: false,
                                        },
                                        angleLines: {
                                            color: '#999',
                                        },
                                        grid: {
                                            color: '#999',
                                        },
                                    },
                                },
                                layout: {
                                    padding: 0,
                                },
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                },
                            }"
                        />
                    </div>
                </div>
            </div>
            <div
                v-if="playlistsStore.playlistDetails.tracks.items.length"
                class="playlist-tracks"
                id="playlist-tracks"
                ref="tracks"
            >
                <SpotifyTrack
                    v-for="(track, index) in playlistsStore.getPlaylistTracks"
                    :key="index"
                    :track="track.track"
                    :index="index + 1"
                />
                <div v-if="playlistsStore.moreTracksLoading" class="loader">
                    <SpotifySpinner />
                </div>
            </div>
            <div v-else class="no-tracks">No tracks found</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import './PlaylistDetails.scss';
</style>
