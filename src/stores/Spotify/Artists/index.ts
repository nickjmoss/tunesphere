import axios from 'axios';
import { defineStore } from 'pinia';
import { Artist } from '../types';
import { useSpotifyStore } from '..';

export const useArtistsStore = defineStore('ArtistsStore', {
    state: () => ({
        artists: [] as Artist[],
        filter: 'short_term' as 'short_term' | 'medium_term' | 'long_term',
        nextPage: '',
        loading: false,
        filterLoading: false,
    }),
    actions: {
        async initialize() {
            if (this.artists.length !== 0) {
                return;
            }

            await this.getArtists();
        },
        async getArtists() {
            const spotifyStore = useSpotifyStore();
            const { data } = await axios.get(
                `${spotifyStore.BASE_URL}/me/top/artists?time_range=${this.filter}&limit=50`,
                {
                    headers: {
                        Authorization: `Bearer ${spotifyStore.accessToken}`,
                    },
                },
            );
            this.setArtists(data.items);

            if (data.next) {
                this.setNextPage(data.next);
            } else {
                this.setNextPage('');
            }
        },
        setArtists(tracks: Artist[]) {
            this.artists = tracks;
        },
        setNextPage(nextPage: string) {
            this.nextPage = nextPage;
        },
        async setFilter(filter: 'short_term' | 'medium_term' | 'long_term') {
            this.filterLoading = true;
            this.filter = filter;
            await this.getArtists();
            this.filterLoading = false;
        },
        setLoading(loading: boolean) {
            this.loading = loading;
        },
    },
});
