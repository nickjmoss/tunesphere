<script setup lang="ts">
import {
    XMarkIcon,
    CheckCircleIcon as CheckCircleIconSolid,
    MagnifyingGlassIcon,
} from '@heroicons/vue/24/solid';
import { CheckCircleIcon } from '@heroicons/vue/24/outline';
import SpotifyButton from '../SpotifyButton/SpotifyButton.vue';
import { useForYouStore } from '../../../stores/Spotify/ForYou';

const forYouStore = useForYouStore();

const handleOutsideClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
        forYouStore.setPlaylistModalOpen(false);
    }
};

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    forYouStore.setSearchTerm(target.value);
};

const handleCancel = () => {
    forYouStore.setPlaylistModalOpen(false);
    forYouStore.setAddToPlaylists([]);
    forYouStore.setSearchTerm('');
};
</script>

<template>
    <div
        class="overlay"
        v-if="forYouStore.playlistModalOpen"
        @click="handleOutsideClick"
    >
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">Add Recommendation to Playlist</h2>
                <div
                    class="modal-close"
                    @click="forYouStore.setPlaylistModalOpen(false)"
                >
                    <XMarkIcon class="icon" />
                </div>
            </div>
            <div class="modal-body">
                <div class="search-wrapper">
                    <MagnifyingGlassIcon class="search-icon" />
                    <input
                        placeholder="Search..."
                        class="search-input"
                        @input="handleInput"
                    />
                </div>
                <div class="divider" />
                <div class="playlist-list">
                    <div
                        class="playlist-wrapper"
                        v-for="(
                            playlist, index
                        ) in forYouStore.filteredPlaylists"
                        :key="index"
                        @click="() => forYouStore.togglePlaylist(playlist.id)"
                    >
                        <div class="image-info">
                            <div class="playlist-image">
                                <img
                                    :src="playlist?.images?.[0]?.url"
                                    alt="Playlist Image"
                                />
                            </div>
                            <div class="playlist-info">
                                <h3 class="playlist-name">
                                    {{ playlist.name }}
                                </h3>
                            </div>
                        </div>
                        <div class="playlist-actions">
                            <CheckCircleIcon
                                v-if="
                                    !forYouStore.addToPlaylists.includes(
                                        playlist.id,
                                    )
                                "
                                class="icon"
                            />
                            <CheckCircleIconSolid v-else class="checked-icon" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="divider" />
            <div class="modal-footer">
                <SpotifyButton
                    variant="outlined"
                    size="sm"
                    @click="handleCancel"
                >
                    Cancel
                </SpotifyButton>
                <SpotifyButton
                    variant="primary"
                    size="sm"
                    :disabled="!forYouStore.addToPlaylists.length"
                    @click="forYouStore.addSongToPlaylist()"
                >
                    Add
                </SpotifyButton>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import './SpotifyPlaylistModal.scss';
</style>
