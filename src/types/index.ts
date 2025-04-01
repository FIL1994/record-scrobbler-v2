export interface DiscogsRelease {
  id: number;
  basic_information: {
    title: string;
    year: number;
    master_id: number;
    artists: Array<{
      name: string;
      id: number;
      resource_url: string;
    }>;
    cover_image: string;
  };
}

export interface Album {
  id: number;
  title: string;
  artist: string;
  artistId: number;
  year: number;
  coverImage: string;
}

export interface DiscogsMasterRelease {
  year: number;
}

export interface DiscogsTrack {
  position: string;
  type_: string;
  title: string;
  duration: string;
  artists?: Array<{
    name: string;
    id: number;
  }>;
}

export interface DiscogsReleaseResponse {
  id: number;
  year: number;
  title: string;
  artists: Array<{
    name: string;
    id: number;
    thumbnail_url: string;
  }>;
  tracklist: DiscogsTrack[];
  images: {
    type: "primary" | "secondary";
    uri: string;
    uri150: string;
    width: number;
    height: number;
  }[];
}

export interface LastfmUserInfoResponse {
  user: {
    name: string;
    image: {
      "#text": string;
      size: "small" | "medium" | "large" | "extralarge";
    }[];
    /** URL to the user's profile */
    url: string;
    album_count: string;
    artist_count: string;
    playcount: string;
  };
}

export interface DiscogsArtistResponse {
  id: number;
  name: string;
  profile: string;
  urls: string[];
  images: {
    type: "primary" | "secondary";
    uri: string;
    uri150: string;
    width: number;
    height: number;
  }[];
  members?: Array<{
    id: number;
    name: string;
    active: boolean;
  }>;
}

export interface DiscogsArtistRelease {
  id: number;
  /** Only exists if type is master */
  main_release?: number;
  title: string;
  year: number;
  thumb: string;
  resource_url: string;
  type: "master" | "release";
  role: "Main" | Omit<string, "Main">;
  artist: string;
  format: string;
}
