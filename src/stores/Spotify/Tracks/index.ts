import axios from 'axios';
import { defineStore } from 'pinia';
import { Track } from '../types';
import { useSpotifyStore } from '..';

export const useTrackStore = defineStore('TrackStore', {
    state: () => ({
        tracks: [] as Track[],
        filter: 'short_term' as 'short_term' | 'medium_term' | 'long_term',
        nextPage: '',
        loading: false,
        filterLoading: false,
    }),
    actions: {
        async initialize() {
            if (this.tracks.length !== 0) {
                return;
            }

            await this.getTracks();
        },
        async getTracks() {
            const spotifyStore = useSpotifyStore();
            const { data } = await axios.get(
                `${spotifyStore.BASE_URL}/me/top/tracks?time_range=${this.filter}&limit=50`,
                {
                    headers: {
                        Authorization: `Bearer ${spotifyStore.accessToken}`,
                    },
                },
            );
            this.setTracks(data.items);

            if (data.next) {
                this.setNextPage(data.next);
            } else {
                this.setNextPage('');
            }
        },
        setTracks(tracks: Track[]) {
            this.tracks = tracks;
        },
        setNextPage(nextPage: string) {
            this.nextPage = nextPage;
        },
        async setFilter(filter: 'short_term' | 'medium_term' | 'long_term') {
            this.filterLoading = true;
            this.filter = filter;
            await this.getTracks();
            this.filterLoading = false;
        },
        setLoading(loading: boolean) {
            this.loading = loading;
        },
    },
});
