import axios, { AxiosResponse } from 'axios';
import { defineStore } from 'pinia';
import { Artist, ForYouTrack, Playlist } from '../types';
// @ts-expect-error old npm package
import ColorThief from 'colorthief';
import { useSpotifyStore } from '..';
import { useRecStore } from './Recommendations';
import { useFilterStore } from './Filters';

export const useForYouStore = defineStore('ForYouStore', {
    state: () => ({
        forYouTracks: [] as ForYouTrack[],
        currentForYouTrack: {} as ForYouTrack,
        currentForYouTrackIndex: 0,
        forYouIsPlaying: false,
        dominantColor: '',
        audioPlayer: {} as HTMLAudioElement,
        playlists: [] as Playlist[],
        followedArtists: [] as Artist[],
        addToPlaylists: [] as string[],
        playlistModalOpen: false,
        searchTerm: '',
        loading: false,
    }),
    getters: {
        filteredPlaylists: (state) => {
            if (state.searchTerm) {
                return state.playlists.filter((playlist: Playlist) =>
                    playlist.name
                        .toLowerCase()
                        .includes(state.searchTerm.toLowerCase()),
                );
            }

            return state.playlists;
        },
        getPlaylistOptions: (state) => {
            const playlistOptions = state.playlists.map(
                (playlist: Playlist) => {
                    return {
                        name: playlist.name,
                        value: playlist.id,
                    };
                },
            );

            return playlistOptions;
        },
        getArtistsOptions: (state) => {
            const artistsOptions = state.followedArtists.map((artist) => {
                return {
                    name: artist.name,
                    value: artist.id,
                };
            });

            return artistsOptions;
        },
    },
    actions: {
        async initialize() {
            this.setLoading(true);
            if (!this.forYouTracks.length) {
                await this.initiateRecommendations(false);
            }

            if (!this.playlists.length) {
                await this.getPlaylists();
            }

            if (!this.followedArtists.length) {
                await this.getFollowedArtists();
            }

            document.addEventListener('keydown', this.handleKeys);

            // In case the user has never interacted with the page
            if (!navigator.userActivation.hasBeenActive) {
                this.setForYouIsPlaying(false);
            } else {
                this.setForYouIsPlaying(true);
            }

            navigator.mediaSession.setActionHandler('play', () => {
                this.handlePlayPause();
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                this.handlePlayPause();
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                this.nextForYouTrack();
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                this.previousForYouTrack();
            });

            this.setLoading(false);
        },
        destroy() {
            document.removeEventListener('keydown', this.handleKeys);
        },
        handleEnded() {
            const audio = document.getElementById(
                'for-you-audio',
            ) as HTMLAudioElement;
            if (audio) {
                audio.currentTime = 0;
                audio.play();
            }
        },
        handleImageLoad() {
            const color = this.getDominantColor();
            this.setDominantColor(color);
        },
        handleKeys(e: KeyboardEvent) {
            if (e.key === 'ArrowRight') {
                this.nextForYouTrack();
            }
            if (e.key === 'ArrowLeft') {
                this.previousForYouTrack();
            }
        },
        handlePlayPause() {
            const audio = document.getElementById(
                'for-you-audio',
            ) as HTMLAudioElement;
            if (audio) {
                if (audio.paused) {
                    audio.play();
                    this.setForYouIsPlaying(true);
                } else {
                    audio.pause();
                    this.setForYouIsPlaying(false);
                }
            }
        },
        setLoading(isLoading: boolean) {
            this.loading = isLoading;
        },
        setForYouIsPlaying(isPlaying: boolean) {
            this.forYouIsPlaying = isPlaying;
        },
        setDominantColor(color: string) {
            this.dominantColor = color;
        },
        setForYouTracks(tracks: ForYouTrack[]) {
            this.forYouTracks = tracks;
        },
        setCurrentForYouTrack(track: ForYouTrack) {
            this.currentForYouTrack = track;
        },
        setPlaylists(playlists: Playlist[]) {
            this.playlists = playlists;
        },
        addPlaylist(playlistId: string) {
            this.addToPlaylists.push(playlistId);
        },
        removePlaylist(playlistId: string) {
            this.addToPlaylists = this.addToPlaylists.filter(
                (id: string) => id !== playlistId,
            );
        },
        togglePlaylist(playlistId: string) {
            if (this.addToPlaylists.includes(playlistId)) {
                this.removePlaylist(playlistId);
            } else {
                this.addPlaylist(playlistId);
            }
        },
        setPlaylistModalOpen(isOpen: boolean) {
            this.playlistModalOpen = isOpen;
        },
        setSearchTerm(term: string) {
            this.searchTerm = term;
        },
        async setLikedSongs(tracks: ForYouTrack[]) {
            const trackIds = tracks.map((track: ForYouTrack) => track.id);
            const likedSongs = await this.trackIsLiked(trackIds);
            return tracks.map((track: ForYouTrack, index: number) => {
                return {
                    ...track,
                    is_liked: likedSongs[index],
                };
            });
        },
        async nextForYouTrack() {
            if (!this.forYouIsPlaying) {
                this.setForYouIsPlaying(true);
            }

            if (this.currentForYouTrackIndex === this.forYouTracks.length - 1) {
                const recs: ForYouTrack[] =
                    await this.generateRecommendations();
                this.setForYouTracks([...this.forYouTracks, ...recs]);
                this.setCurrentForYouTrack(
                    this.forYouTracks[this.currentForYouTrackIndex],
                );
            }

            const forYouAudio = document.getElementById(
                'for-you-audio',
            ) as HTMLAudioElement;

            if (forYouAudio) {
                forYouAudio.pause();
                forYouAudio.currentTime = 0;
                this.currentForYouTrackIndex++;
                this.setCurrentForYouTrack(
                    this.forYouTracks[this.currentForYouTrackIndex],
                );
            }
        },
        previousForYouTrack() {
            if (!this.forYouIsPlaying) {
                this.setForYouIsPlaying(true);
            }

            if (this.currentForYouTrackIndex === 0) {
                return;
            }

            const forYouAudio = document.getElementById(
                'for-you-audio',
            ) as HTMLAudioElement;
            if (forYouAudio) {
                forYouAudio.pause();
                forYouAudio.currentTime = 0;
                this.currentForYouTrackIndex--;
                this.setCurrentForYouTrack(
                    this.forYouTracks[this.currentForYouTrackIndex],
                );
            }
        },
        getDominantColor() {
            const colorThief = new ColorThief();
            const img = document.getElementById(
                'for-you-image',
            ) as HTMLImageElement;
            img.crossOrigin = 'Anonymous';
            const color = colorThief.getColor(img);
            return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        },
        setAddToPlaylists(playlists: string[]) {
            this.addToPlaylists = playlists;
        },
        async getFollowedArtists() {
            const spotifyStore = useSpotifyStore();

            const recursivleyGetAllFollowedArtists = async (
                url: string,
                artists: Artist[] = [],
            ): Promise<Artist[]> => {
                const { data } = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${spotifyStore.accessToken}`,
                    },
                });
                const newArtists: Artist[] = [
                    ...artists,
                    ...data.artists.items,
                ];

                if (data.artists.next) {
                    return recursivleyGetAllFollowedArtists(
                        data.artists.next,
                        newArtists,
                    );
                }
                return newArtists;
            };

            const artists = await recursivleyGetAllFollowedArtists(
                `${spotifyStore.BASE_URL}/me/following?type=artist&limit=50`,
            );

            this.followedArtists = artists;
        },
        async generateRecommendations() {
            try {
                const recStore = useRecStore();
                const filterStore = useFilterStore();

                const recs = await recStore.getRecommendations(
                    filterStore.filter,
                    filterStore.subFilter,
                );

                let filteredTracks = recs.filter(
                    (track: ForYouTrack) => track.preview_url,
                );

                filteredTracks = await this.setLikedSongs(filteredTracks);

                return filteredTracks;
            } catch (err) {
                console.error(err);
            }
        },
        async initiateRecommendations(triggerLoading = true) {
            if (triggerLoading) {
                this.setLoading(true);
            }

            const tracks = await this.generateRecommendations();
            this.setForYouTracks(tracks);
            this.setCurrentForYouTrack(this.forYouTracks[0]);
            this.currentForYouTrackIndex = 0;

            if (triggerLoading) {
                this.setLoading(false);
            }
        },
        async trackIsLiked(trackIds: string[]) {
            const spotifyStore = useSpotifyStore();
            try {
                const { data } = await axios.get(
                    `${
                        spotifyStore.BASE_URL
                    }/me/tracks/contains?ids=${trackIds.join(',')}`,
                    {
                        headers: {
                            Authorization: `Bearer ${spotifyStore.accessToken}`,
                        },
                    },
                );
                return data;
            } catch (err) {
                console.error(err);
            }
        },
        async handleLike() {
            if (this.currentForYouTrack.is_liked) {
                await this.unlikeSong();
            } else {
                await this.likeSong();
            }
        },
        async likeSong() {
            const spotifyStore = useSpotifyStore();
            this.currentForYouTrack.is_liked = true;
            try {
                await axios.put(
                    `${spotifyStore.BASE_URL}/me/tracks?ids=${this.currentForYouTrack.id}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${spotifyStore.accessToken}`,
                        },
                    },
                );
            } catch (err) {
                console.error(err);
            }
        },
        async unlikeSong() {
            const spotifyStore = useSpotifyStore();
            this.currentForYouTrack.is_liked = false;
            try {
                await axios.delete(
                    `${spotifyStore.BASE_URL}/me/tracks?ids=${this.currentForYouTrack.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${spotifyStore.accessToken}`,
                        },
                    },
                );
            } catch (err) {
                console.error(err);
            }
        },
        async getPlaylists() {
            const spotifyStore = useSpotifyStore();

            const recursivleyGetAllPlaylists = async (
                url: string,
                playlists: Playlist[] = [],
            ): Promise<Playlist[]> => {
                const { data } = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${spotifyStore.accessToken}`,
                    },
                });
                const newPlaylists: Playlist[] = [...playlists, ...data.items];

                if (data.next) {
                    return recursivleyGetAllPlaylists(data.next, newPlaylists);
                }
                return newPlaylists;
            };

            const playlists = await recursivleyGetAllPlaylists(
                `${spotifyStore.BASE_URL}/me/playlists?limit=50`,
            );

            this.setPlaylists(playlists);
        },
        async addSongToPlaylist(removeFromLikedSongs: boolean) {
            const spotifyStore = useSpotifyStore();
            try {
                const requests: Array<Promise<AxiosResponse | void>> =
                    this.addToPlaylists.map((playlistId: string) => {
                        return axios.post(
                            `${spotifyStore.BASE_URL}/playlists/${playlistId}/tracks`,
                            {
                                uris: [
                                    `spotify:track:${this.currentForYouTrack.id}`,
                                ],
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${spotifyStore.accessToken}`,
                                },
                            },
                        );
                    });

                if (removeFromLikedSongs) {
                    requests.push(this.unlikeSong());
                }

                await Promise.all(requests);
            } catch (err) {
                console.error(err);
            } finally {
                this.setPlaylistModalOpen(false);
                this.addToPlaylists = [];
                this.setSearchTerm('');
            }
        },
        async removeSongFromPlaylist(playlistId: string) {
            const spotifyStore = useSpotifyStore();
            try {
                await axios.delete(
                    `${spotifyStore.BASE_URL}/playlists/${playlistId}/tracks`,
                    {
                        headers: {
                            Authorization: `Bearer ${spotifyStore.accessToken}`,
                        },
                        data: {
                            tracks: [
                                {
                                    uri: `spotify:track:${this.currentForYouTrack.id}`,
                                },
                            ],
                        },
                    },
                );
            } catch (err) {
                console.error(err);
            }
        },
    },
});
