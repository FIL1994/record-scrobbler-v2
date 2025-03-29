export interface DiscogsRelease {
  id: number;
  basic_information: {
    title: string;
    year: number;
    master_id: number;
    artists: Array<{
      name: string;
    }>;
    cover_image: string;
  };
}

export interface Album {
  title: string;
  artist: string;
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
  title: string;
  artists: Array<{
    name: string;
    id: number;
  }>;
  tracklist: DiscogsTrack[];
  year: number;
}
