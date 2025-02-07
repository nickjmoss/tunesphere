<script setup lang="ts">
import {
    // EllipsisHorizontalIcon,
    PlayIcon,
    PauseIcon,
} from '@heroicons/vue/24/solid';
import { ref } from 'vue';
import { useSpotifyStore } from '../../../stores/Spotify';
import { Artist } from '../../../stores/Spotify/types';
const spotifyStore = useSpotifyStore();
defineProps({
    track: {
        type: Object,
        required: true,
    },
    index: {
        type: Number,
        default: 1,
    },
});

const showPlay = ref(false);
const isPlaying = ref(false);

const formatDuration = (ms: number) => {
    // Convert milliseconds to seconds
    const seconds = Math.floor(ms / 1000);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Format the output
    const formattedMinutes = String(minutes);
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
};

const handleMouseEnter = () => {
    showPlay.value = true;
};

const handleMouseLeave = () => {
    showPlay.value = false;
};

const handlePlay = (trackId: string) => {
    isPlaying.value = true;
    if (spotifyStore.currentTrack) {
        spotifyStore.pauseTrack();
    }
    spotifyStore.playTrack(trackId);
};

const handlePause = () => {
    isPlaying.value = false;
    spotifyStore.pauseTrack();
};

const handleEnded = () => {
    isPlaying.value = false;
    spotifyStore.setCurrentTrack('');
};
</script>

<template>
    <div
        class="track-wrapper"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @dblclick="() => handlePlay(track?.id)"
    >
        <div class="album-track">
            <div class="index">
                <span v-if="!showPlay">{{ index }}</span>
                <span v-else>
                    <PlayIcon
                        class="play"
                        v-if="spotifyStore.currentTrack !== track?.id"
                        @click="() => handlePlay(track?.id)"
                    />
                    <PauseIcon class="pause" v-else @click="handlePause" />
                </span>
            </div>
            <img class="album-image" :src="track?.album?.images?.[1]?.url" />
            <div class="track-artist">
                <div
                    :class="[
                        'track',
                        {
                            'track-active':
                                spotifyStore.currentTrack === track?.id,
                        },
                    ]"
                >
                    {{ track?.name }}
                </div>
                <div class="artist">
                    <span v-if="track?.explicit" class="explicit">E</span>
                    {{
                        track?.artists
                            ?.map((artist: Artist) => artist.name)
                            .join(', ')
                    }}
                </div>
            </div>
        </div>
        <div class="time-action-wrapper">
            {{ formatDuration(track?.duration_ms) }}
            <!-- <EllipsisHorizontalIcon class="icon" /> -->
        </div>
        <audio
            @ended="handleEnded"
            :id="track?.id"
            :src="track?.preview_url"
            preload="auto"
        />
    </div>
</template>

<style scoped lang="scss">
@import './SpotifyTrack.scss';
</style>
