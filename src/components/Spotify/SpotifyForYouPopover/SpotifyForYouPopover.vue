<script setup lang="ts">
import { onMounted } from 'vue';
import SpotifyButton from '../SpotifyButton/SpotifyButton.vue';
import SpotifyDropdown from '../SpotifyDropdown/SpotifyDropdown.vue';
import { useRecStore } from '../../../stores/Spotify/ForYou/Recommendations';
import { useFilterStore } from '../../../stores/Spotify/ForYou/Filters';
import { useForYouStore } from '../../../stores/Spotify/ForYou';
import { Filter } from '../../../stores/Spotify/types';
defineProps({
    open: {
        type: Boolean,
        required: true,
    },
});

const recStore = useRecStore();
const filterStore = useFilterStore();
const forYouStore = useForYouStore();

onMounted(async () => {
    await recStore.initiliaze();
});

const handleRadioChange = (event: Event) => {
    filterStore.setTempFilter(
        (event.target as HTMLInputElement).value as Filter,
    );
};

const handleApplyFilters = async () => {
    filterStore.applyFilters();
    await forYouStore.initiateRecommendations();
    forYouStore.setForYouIsPlaying(true);
};

const timeRangeOptions = [
    {
        name: 'Last 4 Weeks',
        value: 'short_term',
    },
    {
        name: 'Last 6 Months',
        value: 'medium_term',
    },
    {
        name: 'All Time',
        value: 'long_term',
    },
];

const radioOptions = [
    {
        id: 'for-you-radio-1',
        name: 'for-you-radio',
        value: 'myRecentlyPlayed',
        label: 'My Recently Played',
    },
    {
        id: 'for-you-radio-2',
        name: 'for-you-radio',
        value: 'myTopTracks',
        label: 'My Top Tracks',
        filterName: 'Time Range:',
        props: {
            options: timeRangeOptions,
        },
    },
    {
        id: 'for-you-radio-3',
        name: 'for-you-radio',
        value: 'myTopArtists',
        label: 'My Top Artists',
        filterName: 'Time Range:',
        props: {
            options: timeRangeOptions,
            placeholder: 'Select an option',
        },
    },
    {
        id: 'for-you-radio-4',
        name: 'for-you-radio',
        value: 'myPlaylists',
        label: 'A Playlist',
        filterName: 'Playlist:',
        props: {
            options: forYouStore.getPlaylistOptions,
            placeholder: 'Select an option',
            searchable: true,
        },
    },
    {
        id: 'for-you-radio-5',
        name: 'for-you-radio',
        value: 'myFollowedArtists',
        label: 'An Artist I Follow',
        filterName: 'Artist:',
        props: {
            options: forYouStore.getArtistsOptions,
            placeholder: 'Select an option',
            searchable: true,
        },
    },
];
</script>

<template>
    <div class="popover-wrapper">
        <div class="popover-content" v-if="open" @click.stop>
            <div class="content-wrapper">
                <div class="popover-title">
                    Give me recommendations based on:
                </div>
                <div class="divider" />
                <div
                    v-for="radioOption in radioOptions"
                    :key="radioOption.id"
                    class="radio-option"
                >
                    <label :for="radioOption.id" class="label">
                        <input
                            type="radio"
                            :id="radioOption.id"
                            :name="radioOption.name"
                            :value="radioOption.value"
                            class="radio-input"
                            :checked="filterStore.filter === radioOption.value"
                            @change="handleRadioChange"
                        />
                        {{ radioOption.label }}
                    </label>
                    <div
                        class="dropdown"
                        v-if="
                            radioOption.props &&
                            filterStore.showSubFilter(radioOption)
                        "
                    >
                        <div v-if="radioOption.filterName" class="label">
                            {{ radioOption.filterName }}
                        </div>
                        <component
                            :is="SpotifyDropdown"
                            v-bind="radioOption.props"
                            :on-value-change="filterStore.setTempSubFilter"
                            :current-option="
                                filterStore.currentSubFilterOption(radioOption)
                            "
                        />
                    </div>
                </div>
                <div class="divider" />
                <div class="footer">
                    <SpotifyButton
                        variant="outlined"
                        @click="filterStore.handleCancel"
                    >
                        Cancel
                    </SpotifyButton>
                    <SpotifyButton
                        :disabled="filterStore.applyDisabled"
                        @click="handleApplyFilters"
                    >
                        Apply
                    </SpotifyButton>
                </div>
            </div>
        </div>
        <slot></slot>
    </div>
</template>

<style scoped lang="scss">
@import './SpotifyForYouPopover.scss';
</style>
