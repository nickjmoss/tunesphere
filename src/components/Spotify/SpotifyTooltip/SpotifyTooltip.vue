<script setup lang="ts">
defineProps({
    message: {
        type: String,
        required: true,
    },
});
</script>

<template>
    <div class="tooltip-wrapper">
        <slot />
        <div class="tooltip">
            {{ message }}
        </div>
    </div>
</template>

<style scoped lang="scss">
@import './SpotifyTooltip.scss';
</style>
