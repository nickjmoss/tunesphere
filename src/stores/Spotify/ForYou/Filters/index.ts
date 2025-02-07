import { defineStore } from 'pinia';
import { Filter, SubFilter, RadioOption } from '../../types';

export const useFilterStore = defineStore('FilterStore', {
    state: () => ({
        popoverOpen: false,
        filter: 'myRecentlyPlayed' as Filter,
        tempFilter: 'myRecentlyPlayed' as Filter,
        subFilter: '' as SubFilter,
        tempSubFilter: '' as SubFilter,
    }),
    getters: {
        applyDisabled(state) {
            if (!state.filter) {
                return true;
            }

            if (state.tempFilter !== 'myRecentlyPlayed') {
                if (state.tempSubFilter) {
                    return false;
                }

                return true;
            }

            if (this.isDirty) {
                return false;
            }

            return true;
        },
        isDirty: (state) => {
            if (state.filter !== state.tempFilter) {
                return true;
            }

            if (state.subFilter !== state.tempSubFilter) {
                return true;
            }

            return false;
        },
        showSubFilter: (state) => {
            return (radioOption: RadioOption) => {
                if (!state.tempFilter) {
                    if (radioOption.value === state.filter) {
                        return true;
                    }
                }

                if (state.tempFilter) {
                    if (radioOption.value === state.tempFilter) {
                        return true;
                    }
                }

                return false;
            };
        },
        currentSubFilterOption: (state) => {
            return (radioOption: RadioOption) => {
                return radioOption.props?.options?.find(
                    (option) => option.value === state.subFilter,
                );
            };
        },
    },
    actions: {
        handleCancel() {
            this.tempFilter = this.filter;
            this.tempSubFilter = this.subFilter;
            this.popoverOpen = false;
        },
        handlePopover() {
            this.popoverOpen = !this.popoverOpen;
        },
        handleFilter(filter: Filter) {
            this.filter = filter;
        },
        setFilter(filter: Filter) {
            this.filter = filter;
        },
        setTempFilter(filter: Filter) {
            this.tempFilter = filter;
            this.tempSubFilter = '';
        },
        setSubFilter(subFilter: SubFilter) {
            this.subFilter = subFilter;
        },
        setTempSubFilter(subFilter: SubFilter) {
            this.tempSubFilter = subFilter;
        },
        applyFilters() {
            this.filter = this.tempFilter ? this.tempFilter : this.filter;
            this.subFilter = this.tempSubFilter
                ? this.tempSubFilter
                : this.subFilter;
            this.tempFilter = null;
            this.tempSubFilter = null;
            this.popoverOpen = false;
        },
    },
});
