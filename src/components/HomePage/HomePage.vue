<script setup lang="ts">
import { useSpotifyStore } from '../../stores/Spotify';
import { usePlaybackStore } from '../../stores/Spotify/Playback';
import SpotifyButton from '../Spotify/SpotifyButton/SpotifyButton.vue';
import SpotifyTrack from '../Spotify/SpotifyTrack/SpotifyTrack.vue';
import SpotifyArtist from '../Spotify/SpotifyArtist/SpotifyArtist.vue';
import SpotifyLoader from '../Spotify/SpotifyLoader/SpotifyLoader.vue';
import SpotifyBarsIcon from '../Spotify/SpotifyBarsIcon/SpotifyBarsIcon.vue';
import SpotifySpinner from '../Spotify/SpotifySpinner/SpotifySpinner.vue';
import { PlayCircleIcon, PauseCircleIcon } from '@heroicons/vue/24/solid';
import { onMounted } from 'vue';
const spotifyStore = useSpotifyStore();
const playbackStore = usePlaybackStore();

onMounted(async () => {
    playbackStore.setLoading(true);
    await playbackStore.initialize();
    playbackStore.setLoading(false);
});

const handleClick = () => {
    window.open(spotifyStore.me.external_urls.spotify, '_blank');
};
</script>

<template>
    <div>
        <div v-if="spotifyStore.loading">
            <SpotifyLoader />
        </div>
        <div
            v-if="spotifyStore.me.id && !spotifyStore.loading"
            class="home-wrapper"
        >
            <div class="profile-wrapper">
                <div class="profile-main">
                    <img
                        v-if="spotifyStore.me.images?.length"
                        class="profile"
                        :src="spotifyStore?.me?.images?.[0]?.url"
                        alt="Spotify Profile Pic"
                    />
                    <div v-else class="profile no-image">No Profile Image</div>
                    <div>
                        <div class="username">
                            <SpotifyButton
                                variant="link"
                                button-style="font-size: 50px"
                                @click="handleClick"
                            >
                                {{ spotifyStore.me.display_name }}
                            </SpotifyButton>
                        </div>
                        <div class="profile-info">
                            <div class="stat">
                                <span class="stat-num">{{
                                    spotifyStore.me.followers.total
                                }}</span>
                                <span class="stat-desc">Followers</span>
                            </div>
                            <div class="stat">
                                <span class="stat-num">{{
                                    spotifyStore.me.followingTotal
                                }}</span>
                                <span class="stat-desc">Following</span>
                            </div>
                            <div class="stat">
                                <span class="stat-num">{{
                                    spotifyStore.me.playlistsTotal
                                }}</span>
                                <span class="stat-desc">Playlists</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="currently-playing-wrapper"
                    v-if="!playbackStore.loading"
                >
                    <div class="album">
                        <img
                            :src="
                                playbackStore.noPlayback
                                    ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Spotify_App_Logo.svg/240px-Spotify_App_Logo.svg.png'
                                    : playbackStore.getAlbumArt
                            "
                            alt="Album Artwork"
                        />
                        <div
                            class="track-info"
                            v-if="!playbackStore.noPlayback"
                        >
                            <div class="track-name">
                                {{ playbackStore.getTrackName }}
                                <div
                                    class="play-bars"
                                    v-if="playbackStore.isPlaying"
                                >
                                    <SpotifyBarsIcon />
                                </div>
                            </div>
                            <div class="track-artist">
                                {{ playbackStore.getArtistName }}
                            </div>
                            <div
                                class="device"
                                v-if="playbackStore.getDeviceName"
                            >
                                {{ playbackStore.getDeviceName }}
                            </div>
                        </div>
                        <div class="no-playback" v-else>
                            Oops! Looks like there's no recent playback history.
                            Play something inside of Spotify to see it here.
                        </div>
                    </div>
                    <div v-if="!playbackStore.noPlayback">
                        <PlayCircleIcon
                            class="play-pause"
                            v-if="!playbackStore.isPlaying"
                            @click="playbackStore.playPlayback"
                        />
                        <PauseCircleIcon
                            class="play-pause"
                            v-else
                            @click="playbackStore.pausePlayback"
                        />
                    </div>
                </div>
                <div v-if="playbackStore.loading" class="playback-loader">
                    <SpotifySpinner />
                </div>
            </div>
            <div class="top-grid">
                <div>
                    <div class="column-header">
                        <div class="column-title">
                            Your Favorite Tracks Recently
                        </div>
                        <SpotifyButton
                            variant="outlined"
                            size="sm"
                            @click="() => $router.push('tracks')"
                        >
                            See More
                        </SpotifyButton>
                    </div>
                    <div class="divider"></div>
                    <div v-if="spotifyStore.recentTracks.length">
                        <SpotifyTrack
                            v-for="(track, index) in spotifyStore.recentTracks"
                            :index="index + 1"
                            :track="track"
                            :key="index"
                        />
                    </div>
                    <div v-else>
                        <div class="no-data">
                            Oops! No recent tracks found. Play some music on
                            Spotify to see your recent tracks.
                        </div>
                    </div>
                </div>
                <div>
                    <div class="column-header">
                        <div class="column-title">
                            Your Favorite Artists Recently
                        </div>
                        <SpotifyButton
                            variant="outlined"
                            size="sm"
                            @click="() => $router.push('artists')"
                        >
                            See More
                        </SpotifyButton>
                    </div>
                    <div class="divider"></div>
                    <div v-if="spotifyStore.recentArtists.length">
                        <SpotifyArtist
                            v-for="(
                                artist, index
                            ) in spotifyStore.recentArtists"
                            :index="index + 1"
                            :artist="artist"
                            :key="index"
                        />
                    </div>
                    <div v-else>
                        <div class="no-data">
                            Oops! No recent artists found. Play some music on
                            Spotify to see your recent artists.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import './HomePage.scss';
</style>
