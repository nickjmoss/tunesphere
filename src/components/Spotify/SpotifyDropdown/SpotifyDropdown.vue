<script setup lang="ts">
import { ref } from 'vue';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    CheckCircleIcon,
} from '@heroicons/vue/24/solid';
const dropdownOpen = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);

const props = defineProps({
    options: {
        type: Array<{ name: string; value: string }>,
        required: true,
    },
    placeholder: {
        type: String,
        required: false,
        default: 'Select...',
    },
    onValueChange: {
        type: Function,
        required: false,
        default: () => {},
    },
    currentOption: {
        type: Object as () => { name: string; value: string } | null,
        required: false,
        default: null,
    },
    searchable: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const filteredOptions = ref(props.options);

const selectedOption = ref<null | { name: string; value: string }>(
    props.currentOption,
);

const searchText = ref(selectedOption.value?.name || '');

const handleSearch = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    searchText.value = value;
    if (value) {
        filteredOptions.value = props.options.filter((option) =>
            option.name.toLowerCase().includes(value.toLowerCase()),
        );
    } else {
        filteredOptions.value = props.options;
    }
};

const toggleDropdown = () => {
    if (dropdownOpen.value) {
        searchInput.value?.blur();
        searchText.value = selectedOption.value?.name || '';
    }
    dropdownOpen.value = !dropdownOpen.value;
};
</script>

<template>
    <div class="dropdown-wrapper" @blur="dropdownOpen = false">
        <div
            :class="{ box: true, gray: !selectedOption?.name }"
            @click="toggleDropdown"
        >
            <input
                ref="searchInput"
                class="search-input"
                :style="{
                    cursor: searchable ? 'text' : 'pointer',
                    userSelect: searchable ? 'text' : 'none',
                }"
                :placeholder="placeholder"
                @input="handleSearch"
                :value="searchText"
                :readonly="!searchable"
            />
            <div class="arrow">
                <ChevronDownIcon v-if="!dropdownOpen" />
                <ChevronUpIcon v-if="dropdownOpen" />
            </div>
        </div>
        <div class="option-list" v-if="dropdownOpen">
            <div
                class="option"
                v-for="option in filteredOptions"
                :key="option.value"
                @click="
                    selectedOption = option;
                    dropdownOpen = false;
                    searchText = option.name;
                    onValueChange(option.value);
                "
            >
                {{ option.name }}
                <div class="check">
                    <CheckCircleIcon
                        v-if="selectedOption?.value === option.value"
                    />
                </div>
            </div>
            <div v-if="!filteredOptions.length" class="no-option">
                No options available
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import './SpotifyDropdown.scss';
</style>
