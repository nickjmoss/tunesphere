import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './components/HomePage/HomePage.vue';
import ForYou from './components/ForYouPage/ForYouPage.vue';
import TracksPage from './components/TracksPage/TracksPage.vue';
import ArtistsPage from './components/ArtistsPage/ArtistsPage.vue';
import PlaylistsPage from './components/PlaylistsPage/PlaylistsPage.vue';
import PlaylistDetails from './components/PlaylistsPage/PlaylistDetails/PlaylistDetails.vue';
import { useSpotifyStore } from './stores/Spotify';

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomePage,
    },
    {
        path: '/for-you',
        name: 'for-you',
        component: ForYou,
    },
    {
        path: '/tracks',
        name: 'tracks',
        component: TracksPage,
    },
    {
        path: '/artists',
        name: 'artists',
        component: ArtistsPage,
    },
    {
        path: '/playlists',
        name: 'playlists',
        component: PlaylistsPage,
    },
    {
        path: '/playlists/:id',
        name: 'playlist-details',
        component: PlaylistDetails,
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to, _, next) => {
    const spotifyStore = useSpotifyStore();
    if (!spotifyStore.accessToken && to.name !== 'home') {
        return next({ name: 'home' });
    }
    spotifyStore.setCurrentTrack('');
    next();
});

export default router;
