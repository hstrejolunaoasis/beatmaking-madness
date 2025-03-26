export interface Genre {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    beats: number;
  };
}

export interface GenreFormValues {
  name: string;
  description: string;
  active: boolean;
}

export interface GenreWithBeatsCount extends Genre {
  _count: {
    beats: number;
  };
} 