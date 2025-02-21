import axios from 'axios';
import { defineStore } from 'pinia';
import { useSpotifyStore } from '..';
import { PlaybackState } from '../types';

export const usePlaybackStore = defineStore('PlaybackStore', {
    state: () => ({
        playback: {} as PlaybackState,
        noPlayback: false,
        loading: false,
    }),
    getters: {
        isPlaying(state) {
            return state.playback.is_playing;
        },
        getAlbumArt(state) {
            return state.playback.item?.album?.images?.[0]?.url;
        },
        getTrackName(state) {
            return state.playback.item?.name;
        },
        getArtistName(state) {
            return state.playback.item?.artists?.[0]?.name;
        },
        getDeviceName(state) {
            return state.playback.device?.name;
        },
        getTrackUrl(state) {
            return state.playback.item?.external_urls?.spotify;
        },
    },
    actions: {
        async initialize() {
            await this.getPlayback();
        },
        async getPlayback() {
            const { accessToken } = useSpotifyStore();
            const { data, status } = await axios.get(
                'https://api.spotify.com/v1/me/player',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );

            if (status === 204) {
                this.noPlayback = true;
                return;
            }

            this.playback = data;
        },
        async pausePlayback() {
            const { accessToken } = useSpotifyStore();
            await axios.put(
                'https://api.spotify.com/v1/me/player/pause',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );

            this.playback.is_playing = false;
        },
        async playPlayback() {
            const { accessToken } = useSpotifyStore();
            await axios.put(
                'https://api.spotify.com/v1/me/player/play',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );

            this.playback.is_playing = true;
        },
        setLoading(loading: boolean) {
            this.loading = loading;
        },
    },
});
