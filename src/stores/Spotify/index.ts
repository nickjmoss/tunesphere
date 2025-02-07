import axios from 'axios';
import { defineStore } from 'pinia';
import { Me, Artist, Track } from './types';

export const useSpotifyStore = defineStore('SpotifyStore', {
    state: () => ({
        accessToken: '',
        refreshToken: '',
        EXPIRATION_TIME: 3600 * 1000,
        BASE_URL: 'https://api.spotify.com/v1',
        tokenTimestamp: '',
        me: {} as Me,
        currentTrack: '',
        recentArtists: [] as Artist[],
        recentTracks: [] as Track[],
        loading: false,
    }),
    actions: {
        async initialize() {
            const params = new URLSearchParams(window.location.search);
            const accessToken =
                localStorage.getItem('accessToken') ||
                params.get('access_token');
            const refreshToken =
                localStorage.getItem('refreshToken') ||
                params.get('refresh_token');
            const tokenTimestamp = localStorage.getItem('tokenTimestamp');

            if (params.get('access_token') || params.get('refresh_token')) {
                // @ts-expect-error This is added in the App.vue
                this.$router.replace({ query: null });
            }

            if (
                tokenTimestamp &&
                refreshToken &&
                Date.now() - parseInt(tokenTimestamp) > this.EXPIRATION_TIME
            ) {
                console.warn('Access token has expired, refreshing...');
                this.refreshAccessToken();
                return;
            }

            if (accessToken) {
                if (!tokenTimestamp) {
                    this.setTokenTimestamp();
                }
                this.setAccessToken(accessToken);
            }

            if (refreshToken) {
                this.setRefreshToken(refreshToken);
            }

            if (this.me?.id) {
                return;
            }

            if (this.accessToken) {
                this.me = await this.getMe();
                this.me.followingTotal = (
                    await this.getFollowing()
                ).artists.total;
                this.me.playlistsTotal = (await this.getPlaylists()).total;
                this.recentTracks = (
                    await this.getTopTracks('short_term')
                ).items;
                this.recentArtists = (
                    await this.getTopArtists('short_term', 10)
                ).items;
            }
        },
        async login() {
            window.location.href = '/api/login';
        },
        async logout() {
            this.removeAccessToken();
            this.removeRefreshToken();
            this.removeTokenTimestamp();
            localStorage.removeItem('tokenTimestamp');
            window.location.href = '/';
        },
        async refreshAccessToken() {
            try {
                const { data } = await axios.get(
                    '/api/refresh_token?refresh_token=' +
                        localStorage.getItem('refreshToken'),
                );
                if (data?.error) {
                    throw new Error(
                        'Invalid refresh token, please login again.',
                    );
                }
                const { access_token } = data;
                this.setAccessToken(access_token);
                this.setTokenTimestamp();
                window.location.reload();
            } catch (err) {
                console.error(err);
                this.removeAccessToken();
                this.removeRefreshToken();
                this.removeTokenTimestamp();
            }
        },
        removeAccessToken() {
            this.accessToken = '';
            localStorage.removeItem('accessToken');
        },
        removeRefreshToken() {
            this.refreshToken = '';
            localStorage.removeItem('refreshToken');
        },
        removeTokenTimestamp() {
            this.tokenTimestamp = '';
            localStorage.removeItem('tokenTimestamp');
        },
        setAccessToken(token: string) {
            this.accessToken = token;
            localStorage.setItem('accessToken', token);
        },
        setRefreshToken(token: string) {
            this.refreshToken = token;
            localStorage.setItem('refreshToken', token);
        },
        setTokenTimestamp() {
            this.tokenTimestamp = Date.now().toString();
            localStorage.setItem('tokenTimestamp', Date.now().toString());
        },
        setCurrentTrack(track: string) {
            this.currentTrack = track;
        },
        setLoading(loading: boolean) {
            this.loading = loading;
        },
        pauseTrack() {
            const audio = document.getElementById(
                this.currentTrack,
            ) as HTMLAudioElement;
            audio.pause();
            this.setCurrentTrack('');
        },
        playTrack(id: string) {
            this.setCurrentTrack(id);
            const audio = document.getElementById(id) as HTMLAudioElement;
            audio.currentTime = 0;
            audio.play();
        },
        async getMe() {
            try {
                const { data } = await axios.get(`${this.BASE_URL}/me`, {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                });
                return data;
            } catch (err) {
                console.error(err);
            }
        },
        async getFollowing() {
            try {
                const { data } = await axios.get(
                    `${this.BASE_URL}/me/following?type=artist`,
                    {
                        headers: {
                            Authorization: `Bearer ${this.accessToken}`,
                        },
                    },
                );
                return data;
            } catch (err) {
                console.error(err);
            }
        },
        async getPlaylists() {
            try {
                const { data } = await axios.get(
                    `${this.BASE_URL}/me/playlists`,
                    {
                        headers: {
                            Authorization: `Bearer ${this.accessToken}`,
                        },
                    },
                );
                return data;
            } catch (err) {
                console.error(err);
            }
        },
        async getTopTracks(
            timeframe: 'short_term' | 'medium_term' | 'long_term',
        ) {
            try {
                const { data } = await axios.get(
                    `${this.BASE_URL}/me/top/tracks?time_range=${timeframe}`,
                    {
                        headers: {
                            Authorization: `Bearer ${this.accessToken}`,
                        },
                    },
                );
                return data;
            } catch (err) {
                console.error(err);
            }
        },
        async getTopArtists(
            timeframe: 'short_term' | 'medium_term' | 'long_term',
            limit = 20,
        ) {
            try {
                const { data } = await axios.get(
                    `${this.BASE_URL}/me/top/artists?time_range=${timeframe}&limit=${limit}`,
                    {
                        headers: {
                            Authorization: `Bearer ${this.accessToken}`,
                        },
                    },
                );
                return data;
            } catch (err) {
                console.error(err);
            }
        },
    },
});
