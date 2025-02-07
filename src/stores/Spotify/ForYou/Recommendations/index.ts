import axios from 'axios';
import { defineStore } from 'pinia';
import { Artist, Filter, SubFilter, Track } from '../../types';
import { useSpotifyStore } from '../../';

export const useRecStore = defineStore('RecommendationStore', {
    state: () => ({}),
    actions: {
        async initiliaze() {},
        getSeedFunction(seedType: Filter) {
            if (!seedType) {
                return;
            }

            const seedFunctions = {
                myFollowedArtists: this.getFollowedArtistsSeeds,
                myPlaylists: this.getMyPlaylistSeeds,
                myTopTracks: this.getMyTopTracksSeeds,
                myTopArtists: this.getMyTopArtistsSeeds,
                myRecentlyPlayed: this.getMyRecentlyPlayedSeeds,
            };

            return seedFunctions[seedType];
        },
        async getFollowedArtistsSeeds(artistId: string) {
            if (!artistId) {
                return;
            }

            const spotifyStore = useSpotifyStore();
            const token = spotifyStore.accessToken;

            const { data }: { data: { tracks: Track[] } } = await axios.get(
                `${spotifyStore.BASE_URL}/artists/${artistId}/top-tracks?market=US`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const seedTracks = data.tracks
                .slice(0, 4)
                .map((track: Track) => track.id);

            return {
                seedTracks,
                seedArtists: [artistId],
            };
        },
        async getMyPlaylistSeeds(playlistId: string) {
            if (!playlistId) {
                return;
            }

            const spotifyStore = useSpotifyStore();
            const token = spotifyStore.accessToken;

            const { data } = await axios.get(
                `${spotifyStore.BASE_URL}/playlists/${playlistId}/tracks?limit=50`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const seedTracks = data.items
                .slice(0, 3)
                .map((item: { track: Track }) => item.track.id);

            const artistsMap = new Map();

            data.items.forEach((item: { track: Track }) => {
                const artists = item.track.artists;
                artists.forEach((artist: Artist) => {
                    if (artistsMap.has(artist.id)) {
                        artistsMap.set(
                            artist.id,
                            artistsMap.get(artist.id) + 1,
                        );
                    } else {
                        artistsMap.set(artist.id, 1);
                    }
                });
            });

            const seedArtists = Array.from(artistsMap.keys())
                .sort((a, b) => artistsMap.get(b) - artistsMap.get(a))
                .slice(0, 2);

            return {
                seedTracks,
                seedArtists,
            };
        },
        async getMyTopTracksSeeds(timeRange = 'short_term') {
            if (!timeRange) {
                return;
            }

            const spotifyStore = useSpotifyStore();
            const token = spotifyStore.accessToken;

            const { data } = await axios.get(
                `${spotifyStore.BASE_URL}/me/top/tracks?time_range=${timeRange}&limit=50`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const seedTracks = data.items
                .slice(0, 3)
                .map((track: Track) => track.id);

            const artistsMap = new Map();

            data.items.forEach((item: { artists: Artist[] }) => {
                const artists = item.artists;
                artists.forEach((artist: Artist) => {
                    if (artistsMap.has(artist.id)) {
                        artistsMap.set(
                            artist.id,
                            artistsMap.get(artist.id) + 1,
                        );
                    } else {
                        artistsMap.set(artist.id, 1);
                    }
                });
            });

            const seedArtists = Array.from(artistsMap.keys())
                .sort((a, b) => artistsMap.get(b) - artistsMap.get(a))
                .slice(0, 2);

            return {
                seedTracks,
                seedArtists,
            };
        },
        async getMyTopArtistsSeeds(timeRange = 'short_term') {
            if (!timeRange) {
                return;
            }

            const spotifyStore = useSpotifyStore();
            const token = spotifyStore.accessToken;

            const { data } = await axios.get(
                `${spotifyStore.BASE_URL}/me/top/artists?time_range=${timeRange}&limit=50`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const seedArtists = data.items
                .slice(0, 5)
                .map((artist: Artist) => artist.id);

            return {
                seedArtists,
                seedTracks: [],
            };
        },
        async getMyRecentlyPlayedSeeds() {
            const spotifyStore = useSpotifyStore();
            const token = spotifyStore.accessToken;

            const { data } = await axios.get(
                `${spotifyStore.BASE_URL}/me/player/recently-played?limit=5`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const seedTracks = data.items
                .slice(0, 5)
                .map((item: { track: Track }) => item.track.id);

            return {
                seedTracks,
                seedArtists: [],
            };
        },
        async getRecommendations(filter: Filter, subFilter: SubFilter = '') {
            if (subFilter === null) {
                return;
            }

            const seedFunction = this.getSeedFunction(filter);
            if (!seedFunction) {
                return;
            }

            const seeds = await seedFunction(subFilter);

            if (!seeds) {
                return;
            }

            const seedTracksJoined = seeds.seedTracks.join(',');
            const seedArtistsJoined = seeds.seedArtists.join(',');

            const spotifyStore = useSpotifyStore();

            const { data } = await axios.get(
                `${spotifyStore.BASE_URL}/recommendations?market=US&seed_tracks=${seedTracksJoined}&seed_artists=${seedArtistsJoined}&limit=50`,
                {
                    headers: {
                        Authorization: `Bearer ${spotifyStore.accessToken}`,
                    },
                },
            );

            return data.tracks;
        },
    },
});
