export interface Band {
  _id: string
  id: number
  title: string
  genre: string
  formedIn: string | number
  yearsActive: string
  label: string
  lineup: []
  exLineup: []
  country: string
  city: string
  status: string
  lyricsTheme: string
  albums: Album[]
  videos: []
  socials: {
    facebook: string
    vk: string
    bandcamp: string
  }
  photos: string[]
  logoUrl: string
  photoUrl: string
  description: string
}

export interface Album {
  id: number
  title: string
  band: Band
  cover: string
  type: string
  genres: string[]
  tracks: string[]
  releaseDate: string
  format: string
  label: string
  catalogId: string
  limitations: number
  lineup: []
  description: string
  links: {
    bandcamp: string
    discogs: string
    yaMusic: string
    spotify: string
  }
}
