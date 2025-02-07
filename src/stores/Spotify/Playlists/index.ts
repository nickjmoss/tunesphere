import axios from 'axios';
import { defineStore } from 'pinia';
import { useSpotifyStore } from '..';
import {
    AudioFeaturesObject,
    Playlist,
    PlaylistDetails,
    PlaylistTracks,
} from '../types';

export const usePlaylistsStore = defineStore('PlaylistsStore', {
    state: () => ({
        playlists: [] as Playlist[],
        playlistsNextPage: '',
        detailsNextPage: '',
        playlistDetails: {} as PlaylistDetails,
        playlistDetailsLoading: false,
        playlistsLoading: false,
        morePlaylistsLoading: false,
        moreTracksLoading: false,
        audioFeatures: [] as AudioFeaturesObject[],
        sortOption: '',
    }),
    getters: {
        getPlaylistTracks(state) {
            return state.playlistDetails.tracks.items;
        },
        getAudioMetrics(state) {
            if (state.audioFeatures.length !== 0) {
                const audioSum = state.audioFeatures.reduce(
                    (acc, curr) => {
                        return {
                            acousticness: acc.acousticness + curr.acousticness,
                            danceability: acc.danceability + curr.danceability,
                            energy: acc.energy + curr.energy,
                            instrumentalness:
                                acc.instrumentalness + curr.instrumentalness,
                            liveness: acc.liveness + curr.liveness,
                            speechiness: acc.speechiness + curr.speechiness,
                            valence: acc.valence + curr.valence,
                        };
                    },
                    {
                        acousticness: 0,
                        danceability: 0,
                        energy: 0,
                        instrumentalness: 0,
                        liveness: 0,
                        speechiness: 0,
                        valence: 0,
                    },
                );

                const averages = {
                    acousticness:
                        audioSum.acousticness / state.audioFeatures.length,
                    danceability:
                        audioSum.danceability / state.audioFeatures.length,
                    energy: audioSum.energy / state.audioFeatures.length,
                    instrumentalness:
                        audioSum.instrumentalness / state.audioFeatures.length,
                    liveness: audioSum.liveness / state.audioFeatures.length,
                    speechiness:
                        audioSum.speechiness / state.audioFeatures.length,
                    valence: audioSum.valence / state.audioFeatures.length,
                };

                return Object.values(averages);
            } else {
                return [0, 0, 0, 0, 0, 0, 0];
            }
        },
        getSortedPlaylists(state) {
            if (state.sortOption === 'tracksDesc') {
                const sortedPlaylist = [...state.playlists];
                return sortedPlaylist.sort((a, b) => {
                    const aTracks = (a.tracks as PlaylistTracks).total;
                    const bTracks = (b.tracks as PlaylistTracks).total;
                    if (aTracks > bTracks) {
                        return -1;
                    }
                    if (aTracks < bTracks) {
                        return 1;
                    }
                    return 0;
                });
            } else if (state.sortOption === 'tracksAsc') {
                const sortedPlaylist = [...state.playlists];
                return sortedPlaylist.sort((a, b) => {
                    const aTracks = (a.tracks as PlaylistTracks).total;
                    const bTracks = (b.tracks as PlaylistTracks).total;
                    if (aTracks < bTracks) {
                        return -1;
                    }
                    if (aTracks > bTracks) {
                        return 1;
                    }
                    return 0;
                });
            } else {
                return state.playlists;
            }
        },
    },
    actions: {
        async initialize() {
            if (this.playlists.length !== 0) {
                return;
            }

            await this.getPlaylists();
        },
        async initializeDetails(id: string) {
            if (this.playlistDetails.id === id) {
                return;
            }

            await this.getPlaylistDetails(id);
            await this.getAudioFeatures(
                this.playlistDetails.tracks.items.map((item) => item.track.id),
            );
        },
        async getPlaylistDetails(id: string) {
            const spotifyStore = useSpotifyStore();
            const { data } = await axios.get(
                `${spotifyStore.BASE_URL}/playlists/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${spotifyStore.accessToken}`,
                    },
                },
            );

            console.log(data);

            this.setPlaylistDetails(data);
        },
        async getPlaylists() {
            const spotifyStore = useSpotifyStore();
            const { data } = await axios.get(
                `${spotifyStore.BASE_URL}/me/playlists?limit=40`,
                {
                    headers: {
                        Authorization: `Bearer ${spotifyStore.accessToken}`,
                    },
                },
            );

            this.setPlaylists(data.items);

            if (data.next) {
                this.setPlaylistsNextPage(data.next);
            } else {
                this.setPlaylistsNextPage('');
            }
        },
        async loadMorePlaylists() {
            const nextPage = this.playlistsNextPage;

            if (!nextPage) {
                return;
            }

            if (this.morePlaylistsLoading) {
                return;
            }

            this.morePlaylistsLoading = true;

            const spotifyStore = useSpotifyStore();
            const { data } = await axios.get(nextPage, {
                headers: {
                    Authorization: `Bearer ${spotifyStore.accessToken}`,
                },
            });

            this.setPlaylists([...this.playlists, ...data.items]);

            if (data.next) {
                this.setPlaylistsNextPage(data.next);
            } else {
                this.setPlaylistsNextPage('');
            }

            this.morePlaylistsLoading = false;
        },
        async loadMoreTracks() {
            const nextPage = this.playlistDetails.tracks.next;

            if (!nextPage) {
                return;
            }

            if (this.moreTracksLoading) {
                return;
            }

            this.moreTracksLoading = true;

            const spotifyStore = useSpotifyStore();
            const { data } = await axios.get(nextPage, {
                headers: {
                    Authorization: `Bearer ${spotifyStore.accessToken}`,
                },
            });

            this.setPlaylistDetails({
                ...this.playlistDetails,
                tracks: {
                    ...this.playlistDetails.tracks,
                    items: [
                        ...this.playlistDetails.tracks.items,
                        ...data.items,
                    ],
                    next: data.next,
                },
            });

            this.moreTracksLoading = false;
        },
        setPlaylists(playlists: Playlist[]) {
            this.playlists = playlists;
        },
        setPlaylistDetails(playlist: PlaylistDetails) {
            this.playlistDetails = playlist;
        },
        setPlaylistsNextPage(nextPage: string) {
            this.playlistsNextPage = nextPage;
        },
        setPlaylistDetailsLoading(loading: boolean) {
            this.playlistDetailsLoading = loading;
        },
        setPlaylistsLoading(loading: boolean) {
            this.playlistsLoading = loading;
        },
        setAudioFeatures(features: AudioFeaturesObject[]) {
            this.audioFeatures = features;
        },
        setSortOption(option: string) {
            this.sortOption = option;
        },
        async getAudioFeatures(ids: string[]) {
            if (ids.length === 0) {
                return;
            }

            const spotifyStore = useSpotifyStore();
            const { data } = await axios.get(
                `${spotifyStore.BASE_URL}/audio-features?ids=${ids.join(',')}`,
                {
                    headers: {
                        Authorization: `Bearer ${spotifyStore.accessToken}`,
                    },
                },
            );

            this.setAudioFeatures(data.audio_features);
        },
    },
});
