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