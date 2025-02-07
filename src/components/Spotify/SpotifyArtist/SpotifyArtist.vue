<script setup lang="ts">
// import { EllipsisHorizontalIcon } from '@heroicons/vue/24/solid';
defineProps({
    artist: {
        type: Object,
        required: true,
    },
    index: {
        type: Number,
        default: 1,
    },
});
</script>

<template>
    <div class="artist-wrapper">
        <div class="artist-image">
            <div class="index">
                <span>{{ index }}</span>
            </div>
            <img
                :id="`test-image-${index}`"
                class="image"
                :src="artist?.images?.[1]?.url"
            />
            <div class="artist">
                <div class="track">
                    {{ artist?.name }}
                </div>
            </div>
        </div>
        <div class="action-wrapper">
            <!-- <EllipsisHorizontalIcon class="icon" /> -->
        </div>
    </div>
</template>

<style scoped lang="scss">
@import './SpotifyArtist.scss';
</style>
