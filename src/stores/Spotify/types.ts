export interface Image {
    height: number;
    url: string;
    width: number;
}

export interface Track {
    album: Album;
    artists: Artist[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: ExternalIds;
    external_urls: ExternalURL;
    href: string;
    id: string;
    is_playable: boolean;
    linked_from: any;
    restrictions: any;
    name: string;
    popularity: number;
    preview_url: string | null;
    track_number: number;
    type: string;
    uri: string;
    is_local: boolean;
}

export interface ExternalURL {
    spotify: string;
}

export interface Followers {
    href: string | null;
    total: number;
}

export interface Owner {
    external_urls: ExternalURL;
    followers: Followers;
    href: string;
    id: string;
    type: string;
    uri: string;
    display_name: string | null;
}

export interface Artist {
    id: string;
    name: string;
    type: string;
    uri: string;
    href: string;
    external_urls: ExternalURL;
}

export interface Album {
    album_type: string;
    artists: Artist[];
    external_urls: ExternalURL;
    href: string;
    id: string;
    images: Image[];
    is_playable: boolean;
    name: string;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
    type: string;
    uri: string;
}

export interface ExternalIds {
    isrc: string;
    ean: string;
    upc: string;
}

export interface ForYouTrack {
    album: Album;
    artists: Artist[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: ExternalIds;
    external_urls: ExternalURL;
    href: string;
    id: string;
    is_local: boolean;
    is_playable: boolean;
    name: string;
    popularity: number;
    preview_url: string | null;
    track_number: number;
    type: string;
    uri: string;
    is_liked?: boolean;
}

export interface ExplicitContent {
    filter_enabled: boolean;
    filter_locked: boolean;
}

export interface Me {
    country: string;
    display_name: string;
    email: string;
    explicit_content: ExplicitContent;
    external_urls: ExternalURL;
    followers: Followers;
    href: string;
    id: string;
    images: Image[];
    product: string;
    type: string;
    uri: string;
    followingTotal: number;
    playlistsTotal: number;
}

export interface PlaylistTracks {
    href: string;
    total: number;
}

export interface Playlist {
    collaborative: boolean;
    description: string;
    external_urls: ExternalURL;
    href: string;
    id: string;
    images: Image[];
    name: string;
    owner: Owner;
    primary_color: string;
    public: boolean;
    snapshot_id: string;
    tracks: PlaylistTracks | Track[];
    type: string;
    uri: string;
}

export interface PlaylistDetailTrack {
    href: string;
    items: Array<{
        added_at: string;
        added_by: Owner;
        is_local: boolean;
        primary_color: string;
        track: Track;
        video_thumbnail: {
            url: string;
        };
    }>;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
}

export interface PlaylistDetails {
    collaborative: boolean;
    description: string;
    external_urls: ExternalURL;
    followers: Followers;
    href: string;
    id: string;
    images: Image[];
    name: string;
    owner: Owner;
    primary_color: string;
    public: boolean;
    snapshot_id: string;
    tracks: PlaylistDetailTrack;
    type: string;
    uri: string;
}

export interface AudioFeaturesObject {
    acousticness: number;
    analysis_url: string;
    danceability: number;
    duration_ms: number;
    energy: number;
    id: string;
    instrumentalness: number;
    key: number;
    liveness: number;
    loudness: number;
    mode: number;
    speechiness: number;
    tempo: number;
    time_signature: number;
    track_href: string;
    type: string;
    uri: string;
    valence: number;
}

export type Filter =
    | 'myRecentlyPlayed'
    | 'myTopTracks'
    | 'myTopArtists'
    | 'myPlaylists'
    | 'myFollowedArtists'
    | null;

export type SubFilter =
    | 'long_term'
    | 'medium_term'
    | 'short_term'
    | string
    | null;

export interface RadioOption {
    id: string;
    name: string;
    value: string;
    label: string;
    filterName?: string;
    props?: {
        options?: Array<{
            name: string;
            value: string;
        }>;
        placeholder?: string;
    };
}

export interface PlaybackState {
    device: {
        id: string;
        is_active: boolean;
        is_restricted: boolean;
        name: string;
        type: string;
        volume_percent: number;
        supports_volume: boolean;
        is_private_session: boolean;
    };
    repeat_state: string;
    shuffle_state: boolean;
    context: {
        external_urls: ExternalURL;
        href: string;
        type: string;
        uri: string;
    };
    timestamp: number;
    progress_ms: number;
    is_playing: boolean;
    item: Track;
    currently_playing_type: string;
    actions: any;
}
