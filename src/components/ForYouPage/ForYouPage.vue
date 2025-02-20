<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import SpotifyBarsIcon from '../Spotify/SpotifyBarsIcon/SpotifyBarsIcon.vue';
import SpotifyTooltip from '../Spotify/SpotifyTooltip/SpotifyTooltip.vue';
import SpotifyPlaylistModal from '../Spotify/SpotifyPlaylistModal/SpotifyPlaylistModal.vue';
import SpotifyForYouPopover from '../Spotify/SpotifyForYouPopover/SpotifyForYouPopover.vue';
import { useForYouStore } from '../../stores/Spotify/ForYou';
import {
    ForwardIcon,
    BackwardIcon,
    PlayCircleIcon,
    PauseCircleIcon,
    Cog8ToothIcon,
} from '@heroicons/vue/24/solid';
import SpotifyLoader from '../Spotify/SpotifyLoader/SpotifyLoader.vue';
import { useFilterStore } from '../../stores/Spotify/ForYou/Filters';
import ListenOnSpotify from '../Spotify/ListenOnSpotify/ListenOnSpotify.vue';

const forYouStore = useForYouStore();
const filterStore = useFilterStore();

onMounted(forYouStore.initialize);
onUnmounted(forYouStore.destroy);
</script>

<template>
    <div class="for-you-wrapper">
        <SpotifyPlaylistModal />
        <div v-if="forYouStore.loading">
            <SpotifyLoader />
        </div>
        <div class="for-you-player" v-else>
            <div class="for-you-title">
                <div>For You Song Recommendations</div>
                <ListenOnSpotify
                    v-if="
                        forYouStore?.currentForYouTrack?.external_urls?.spotify
                    "
                    :href="
                        forYouStore?.currentForYouTrack?.external_urls?.spotify
                    "
                />
            </div>
            <div class="image-track-artist">
                <img
                    id="for-you-image"
                    :src="
                        forYouStore.currentForYouTrack?.album?.images?.[1]?.url
                    "
                    class="for-you-image"
                    crossorigin="anonymous"
                    @load="forYouStore.handleImageLoad"
                />
                <div class="for-you-info">
                    <div class="track-action-wrapper">
                        <div class="for-you-track">
                            {{ forYouStore.currentForYouTrack?.name }}
                            <div
                                v-if="forYouStore.forYouIsPlaying"
                                style="margin-bottom: 5px"
                                class="play-bars"
                            >
                                <SpotifyBarsIcon />
                            </div>
                        </div>
                        <div class="action-wrapper">
                            <SpotifyTooltip
                                :message="
                                    !forYouStore.currentForYouTrack?.is_liked
                                        ? 'Add to Liked Songs'
                                        : 'Add to Playlist'
                                "
                            >
                                <div class="like-button">
                                    <img
                                        src="/assets/like-icon-like.svg"
                                        v-if="
                                            !forYouStore.currentForYouTrack
                                                .is_liked
                                        "
                                        @click="forYouStore.likeSong"
                                    />
                                    <img
                                        src="/assets/like-icon-liked.svg"
                                        v-else
                                        @click="forYouStore.unlikeSong"
                                    />
                                </div>
                            </SpotifyTooltip>
                        </div>
                    </div>
                    <div class="for-you-artist">
                        <span
                            v-if="forYouStore.currentForYouTrack?.explicit"
                            class="explicit"
                        >
                            E
                        </span>
                        {{
                            forYouStore.currentForYouTrack?.artists
                                ?.map((artist) => artist.name)
                                .join(', ')
                        }}
                    </div>
                </div>
            </div>
            <div class="divider" />
            <div class="controls-wrapper">
                <div class="controls">
                    <div
                        class="control"
                        @click="forYouStore.previousForYouTrack"
                    >
                        <BackwardIcon class="icon" />
                    </div>
                    <div class="control">
                        <span
                            v-if="!forYouStore.forYouIsPlaying"
                            @click="forYouStore.handlePlayPause"
                        >
                            <PlayCircleIcon class="play-pause" />
                        </span>
                        <span v-else @click="forYouStore.handlePlayPause">
                            <PauseCircleIcon class="play-pause" />
                        </span>
                    </div>
                    <div class="control" @click="forYouStore.nextForYouTrack">
                        <ForwardIcon class="icon" />
                    </div>
                </div>
                <div
                    class="settings-wrapper"
                    @click="filterStore.handlePopover"
                >
                    <SpotifyForYouPopover :open="filterStore.popoverOpen">
                        <SpotifyTooltip message="For You Settings">
                            <Cog8ToothIcon class="settings" />
                        </SpotifyTooltip>
                    </SpotifyForYouPopover>
                </div>
            </div>
            <audio
                id="for-you-audio"
                @ended="forYouStore.handleEnded"
                :src="
                    forYouStore.currentForYouTrack?.preview_url
                        ? forYouStore.currentForYouTrack?.preview_url
                        : undefined
                "
                autoplay
            ></audio>
        </div>
        <div
            v-if="forYouStore.currentForYouTrack.id && !forYouStore.loading"
            class="background"
            :style="`background: radial-gradient(circle, ${forYouStore.dominantColor} 0%, #ebebeb 100%);`"
        />
    </div>
</template>

<style scoped lang="scss">
@import './ForYouPage.scss';
</style>
