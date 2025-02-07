<script setup lang="ts">
defineProps({
    variant: {
        type: String,
        default: 'primary',
    },
    size: {
        type: String,
        default: 'sm',
    },
    circle: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    active: {
        type: Boolean,
        default: false,
    },
    buttonStyle: {
        type: String,
        default: '',
    },
    buttonClass: {
        type: String,
        default: '',
    },
});
</script>

<template>
    <button
        class="button"
        :class="[
            variant,
            size,
            circle ? 'circle' : '',
            active ? 'active-text' : '',
            buttonClass,
        ]"
        :disabled="disabled"
        :style="buttonStyle"
    >
        <slot />
    </button>
</template>

<style scoped lang="scss">
@import './SpotifyButton.scss';
</style>
