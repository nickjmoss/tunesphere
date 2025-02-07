<script setup lang="ts">
defineProps({
    height: {
        type: Number,
        default: 1,
    },
});
</script>

<template>
    <div class="spotify-bars">
        <div class="bar delay-1" :style="`height: ${height}px`" />
        <div class="bar delay-3" :style="`height: ${height}px`" />
        <div class="bar delay-2" :style="`height: ${height}px`" />
        <div class="bar delay-4" :style="`height: ${height}px`" />
    </div>
</template>

<style scoped lang="scss">
@import './SpotifyBarsIcon.scss';
</style>
