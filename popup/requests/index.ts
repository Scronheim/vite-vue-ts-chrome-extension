import axios from 'axios'
import cheerio from 'cheerio'

const axiosOptions = {
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 YaBrowser/24.1.0.0 Safari/537.36'
  }
}

const TIMEOUT_ERROR = 'Сайт не ответил вовремя. Попробуйте ещё раз'

export const checkBandExist = async (bandId: number) => {
  const response = await axios.post('/api/search/bands', { condition: '$or', id: bandId })

  if (response.data.data.length) {
    chrome.action.setIcon({ path: '/icons/band-exist.png' })
  } else {
    chrome.action.setIcon({ path: '/icons/band-not-exist.png' })
  }
  return response

}

export const checkAlbumExist = async (albumId: number) => {
  const response = await axios.post('/api/search/albums', { condition: '$or', id: albumId })

  if (response.data.data.length) {
    chrome.action.setIcon({ path: '/icons/band-exist.png' })
  } else {
    chrome.action.setIcon({ path: '/icons/band-not-exist.png' })
  }
  return response

}

export const answerWithAlbum = async (albumId: number) => {
  const { data } = await getAlbumById(albumId)
  const { bandId, id, title, type, releaseDate, label, format, limitations, cover, tracks } = parseAlbumInfo(data)

  return {
    bandId, id, title, type, releaseDate, label, format, limitations, cover, tracks
  }
}

export const answerWithBand = async (bandId: number) => {
  const { data } = await getBandById(bandId)
  const { id, title, description, genre, country, city, lyricsTheme, status, formedIn, label, yearsActive, photoUrl, logoUrl } = parseBandInfo(data)
  // const discography = await parseDiscography(bandId)
  // console.log(discography);

  const linksHtml = await getBandLinks(bandId)
  const { bandcamp } = parseBandLinks(linksHtml.data)
  const intId = parseInt(id)
  const intFormedIn = parseInt(formedIn)

  return {
    id: intId, title, description, genre, country, city, lyricsTheme, status, formedIn: intFormedIn, label, yearsActive, photoUrl, logoUrl,
    socials: {
      bandcamp
    }
  }
}

export const getAlbumById = async (albumId: number | string, retries = 3) => {
  try {
    return await axios.get(`https://www.metal-archives.com/albums/view/id/${albumId}`, axiosOptions)
  } catch (e) {
    if (retries > 0) {
      console.log(`Retrying... attempts left: ${retries - 1}`)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for 1 second before retrying
      return getAlbumById(albumId, retries - 1)
    } else {
      throw new Error(TIMEOUT_ERROR)
    }
  }
}

const getBandDiscography = async (bandId: number | string, retries = 3) => {
  try {
    return await axios.get(`https://www.metal-archives.com/band/discography/id/${bandId}/tab/all`, axiosOptions)
  } catch (e) {
    if (retries > 0) {
      console.log(`Retrying... attempts left: ${retries - 1}`)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for 1 second before retrying
      return getBandDiscography(bandId, retries - 1)
    } else {
      throw new Error(TIMEOUT_ERROR)
    }
  }
}

export const getBandById = async (bandId: number | string, retries = 3) => {
  try {
    return await axios.get(`https://www.metal-archives.com/band/view/id/${bandId}`, axiosOptions)
  } catch (e) {
    if (retries > 0) {
      console.log(`Retrying... attempts left: ${retries - 1}`)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for 1 second before retrying
      return getBandById(bandId, retries - 1)
    } else {
      throw new Error(TIMEOUT_ERROR)
    }
  }
}

export const getBandLinks = async (bandId: number, retries = 3) => {
  try {
    return await axios.get(`https://www.metal-archives.com/link/ajax-list/type/band/id/${bandId}`, axiosOptions)
  } catch (e) {
    if (retries > 0) {
      console.log(`Retrying... attempts left: ${retries - 1}`)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for 1 second before retrying
      return getBandLinks(bandId, retries - 1)
    } else {
      throw new Error(TIMEOUT_ERROR)
    }
  }
}

function parseBandLinks(html: string) {
  const $ = cheerio.load(html)

  let bandcampUrl = null

  $('#linksTablemain tr').children().map((index, el) => {
    if (el.children[0].attribs?.title === 'Go to: Bandcamp') {
      bandcampUrl = el.children[0].attribs?.href
    }
  })

  return { bandcamp: bandcampUrl }
}

function parseAlbumInfo(html: string) {
  const $ = cheerio.load(html)
  const bandId = parseInt($('.band_name a').attr('href').split('/').pop())
  const id = parseInt($('.album_name a').attr('href').split('/').pop())
  const title = $('.album_name a').text()
  const type = $('#album_info .float_left dd').eq(0).text()
  const releaseDate = $('#album_info .float_left dd').eq(1).text()
  const label = $('#album_info .float_right dd').eq(0).text()
  const format = $('#album_info .float_right dd').eq(1).text()
  const limitations = parseInt($('#album_info .float_right dd').eq(2).text())
  const cover = $('#cover').attr('href')
  const tracklistHTML = $('table.table_lyrics tr').not('.displayNone')
  const tracks = []
  for (let index = 0; index < tracklistHTML.length; index++) {
    const track = tracklistHTML.eq(index)
    if (['Side A', 'Side B', 'Single-sided'].includes(track.children().eq(0).text().trim())) {
      tracks.push(track.children().eq(0).text().trim())
      continue
    }

    if (index === tracklistHTML.length - 1) {
      tracks.push(`${track.children().eq(1).text().trim()}`)
    } else {
      tracks.push(`${track.children().eq(0).text().trim()} ${track.children().eq(1).text().trim()} (${track.children().eq(2).text().trim()})\n`)
    }
  }
  return { bandId, id, title, type, releaseDate, label, format, limitations, cover, tracks }
}

function parseBandInfo(html: string) {
  const $ = cheerio.load(html)
  const id = $('input[name=origin]').attr('value').split('/')[4]
  const title = $('.band_name a').text()
  const description = $('.band_comment, clear').text()
  const genre = $('#band_stats .float_right dt').nextAll().eq(0).text()
  const country = $('#band_stats .float_left dt').nextAll().eq(0).text()
  const city = $('#band_stats .float_left dt').nextAll().eq(2).text()
  const lyricsTheme = $('#band_stats .float_right dt').nextAll().eq(2).text()
  const status = $('#band_stats .float_left dt').nextAll().eq(4).text()
  const label = $('#band_stats .float_right dt').nextAll().eq(4).text()
  const formedIn = $('#band_stats .float_left dt').nextAll().eq(6).text()
  const yearsActive = $('#band_stats .float_right').nextAll().eq(0).children()
    .eq(1)
    .text()
    .replace(/\s/g, '')
  const photoUrl = $('#photo').attr('href')
  const logoUrl = $('#logo').attr('href')

  return { id, title, description, genre, country, city, lyricsTheme, status, label, formedIn, yearsActive, photoUrl, logoUrl }
}
