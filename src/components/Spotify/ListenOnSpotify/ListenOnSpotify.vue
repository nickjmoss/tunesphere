<script setup lang="ts">
defineProps({
    href: {
        type: String,
        required: true,
    },
});
</script>

<template>
    <a
        class="listen-wrapper"
        :href="href"
        target="_blank"
        rel="noopener noreferrer"
    >
        <div class="logo">
            <img src="/assets/spotify-logo-white.svg" alt="Listen on Spotify" />
        </div>
        <div>Listen on Spotify</div>
    </a>
</template>

<style lang="scss" scoped>
@import './ListenOnSpotify.scss';
</style>
