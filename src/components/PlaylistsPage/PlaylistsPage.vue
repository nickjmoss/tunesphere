<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { InformationCircleIcon } from '@heroicons/vue/24/solid';
import { usePlaylistsStore } from '../../stores/Spotify/Playlists';
import SpotifyLoader from '../Spotify/SpotifyLoader/SpotifyLoader.vue';
import SpotifyDropdown from '../Spotify/SpotifyDropdown/SpotifyDropdown.vue';
import { PlaylistTracks } from '../../stores/Spotify/types';

const playlistsStore = usePlaylistsStore();

const playlistGrid = ref<HTMLDivElement | null>(null);

const loadMorePlaylists = async () => {
    if (playlistGrid.value) {
        const element = playlistGrid.value;
        const lastChild = element.lastElementChild;
        if (lastChild) {
            const lastChildPosition = lastChild.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;
            if (lastChildPosition < windowHeight) {
                await playlistsStore.loadMorePlaylists();
            }
        }
    }
};

watch(playlistGrid, () => {
    document.addEventListener('scroll', loadMorePlaylists);
});

onMounted(async () => {
    playlistsStore.setPlaylistsLoading(true);
    await playlistsStore.initialize();
    playlistsStore.setPlaylistsLoading(false);
});

onUnmounted(() => {
    document.removeEventListener('scroll', loadMorePlaylists);
});

const sortOptions = [
    { name: 'Track Count: Asc', value: 'tracksAsc' },
    { name: 'Track Count: Desc', value: 'tracksDesc' },
];

const handleSortChange = (value: string) => {
    playlistsStore.setSortOption(value);
};
</script>

<template>
    <div>
        <div v-if="playlistsStore.playlistsLoading">
            <SpotifyLoader />
        </div>
        <div
            class="playlists-page-wrapper"
            v-if="!playlistsStore.playlistsLoading"
        >
            <div class="header">
                <h1>Playlists</h1>
                <div class="sort-wrapper">
                    <div class="sort-select">
                        <SpotifyDropdown
                            :options="sortOptions"
                            :searchable="false"
                            placeholder="Sort By..."
                            :on-value-change="handleSortChange"
                        />
                    </div>
                </div>
            </div>
            <div class="playlist-grid" ref="playlistGrid">
                <div
                    v-for="(
                        playlist, index
                    ) in playlistsStore.getSortedPlaylists"
                    :key="index"
                    class="playlist-wrapper"
                >
                    <div
                        class="image-wrapper"
                        @click="() => $router.push(`/playlists/${playlist.id}`)"
                    >
                        <img
                            :src="
                                playlist?.images?.[0]?.url
                                    ? playlist?.images[0]?.url
                                    : 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Spotify_App_Logo.svg/240px-Spotify_App_Logo.svg.png'
                            "
                        />
                        <div class="overlay" />
                        <InformationCircleIcon class="icon" />
                    </div>
                    <div class="playlist-info">
                        <h3>{{ playlist.name }}</h3>
                        <div class="songs">
                            {{ (playlist.tracks as PlaylistTracks).total }}
                            Tracks
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import './PlaylistsPage.scss';
</style>
