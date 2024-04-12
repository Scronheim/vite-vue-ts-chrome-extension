import axios from 'axios'
import cheerio from 'cheerio'

const axiosOptions = {
  timeout: 3000,
  // headers: {
  //   'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 YaBrowser/24.1.0.0 Safari/537.36'
  // }
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

export const answerWithBand = async (bandId: number) => {
  const { data } = await getBandById(bandId)
  const { id, title, genre, country, city, lyricsTheme, status, formedIn, yearsActive, photoUrl, logoUrl } = parseBandInfo(data)
  // const discography = await parseDiscography(bandId)
  // console.log(discography);

  // const linksHtml = await getBandLinks(bandId)
  // const { bandcampUrl } = parseBandLinks(linksHtml.data)
  const intId = parseInt(id)
  const intFormedIn = parseInt(formedIn)

  return {
    id: intId, title, genre, country, city, lyricsTheme, status, formedIn: intFormedIn, yearsActive, photoUrl, logoUrl
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

function parseBandInfo(html: string) {
  const $ = cheerio.load(html)
  const id = $('input[name=origin]').attr('value').split('/')[4]
  const title = $('.band_name a').text()
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

  return { id, title, genre, country, city, lyricsTheme, status, label, formedIn, yearsActive, photoUrl, logoUrl }
}

async function parseDiscography(bandId) {
  const discographyHTML = await getBandDiscography(bandId)
  const $d = cheerio.load(discographyHTML.data)
  const albums = $d('.display, .discog td').children().eq(1).children()
  const discography = []
  for (let index = 0; index < albums.length; index++) {
    const album = albums.eq(index)
    const albumId = album.children().eq(0).children().eq(0).attr('href').split('/').pop()
    const albumName = album.children().eq(0).text() || ''
    const albumType = album.children().eq(1).text() || ''
    const albumYear = album.children().eq(2).text() || ''
    if (albumName) discography.push({
      id: albumId,
      name: albumName,
      type: albumType,
      year: albumYear,
    })
  }

  return discography
}
