export interface Band {
  _id: string
  title: string
  genre: string
  formedIn: string | number
  yearsActive: string
  label: Label
  lineup: []
  exLineup: []
  country: string
  city: string
  status: string
  lyricsTheme: string
  albums: []
  videos: []
  socials: {
    facebook: string
    vk: string
  }
  photos: string[]
  logoUrl: string
  photoUrl: string
  description: string
}

export interface Label {
  title: string
  country: string
  email: string
  address: string
  phone: string
  links: {
    bandcamp: string
    youtube: string
  }
  logo: string
}