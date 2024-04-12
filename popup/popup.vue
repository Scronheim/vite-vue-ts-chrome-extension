<template>
  <div class="wrapper">
    <template v-if="isBandPage">
      <img :src="band.photoUrl" width="300" />
      <ul v-if="!bandExist">
        <li>{{ band.title }}</li>
        <li>{{ band.country }} ({{ band.city }})</li>
        <li>{{ band.genre }}</li>
        <li>{{ band.lyricsTheme }}</li>
      </ul>
    </template>
    <template v-else>
      <img :src="album.cover" width="300" />
      <ul v-if="!albumExist">
        <li>{{ album.title }}</li>
        <li>{{ album.type }}</li>
        <li>{{ album.releaseDate }}</li>
        <li>{{ album.format }}</li>
      </ul>
      <p v-for="(track, index) in album.tracks" :key="index">{{ track }}</p>
    </template>
    {{ status }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

import { answerWithBand, answerWithAlbum, checkBandExist, checkAlbumExist } from './requests/index'

import type { Band, Album } from './types'


const band: Band = ref({})
const album: Album = ref({})
const status = ref('')
const bandExist = ref(false)
const albumExist = ref(false)
const isBandPage = ref(false)
const activeTab = ref({})

const getIsBandPage = () => {
  isBandPage.value = activeTab.value.url.startsWith('https://www.metal-archives.com/band/view/id/')
    || activeTab.value.url.startsWith('https://www.metal-archives.com/bands/')
}

const setActiveTab = async () => {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  activeTab.value = tab
  // const response = await chrome.runtime.sendMessage('getDOM')
  // console.log(response)

}

const parseBand = async () => {
  const bandId = Number(activeTab.value.url?.split('/').pop())
  status.value = 'Проверяю наличие группы в базе'
  const { data } = await checkBandExist(bandId)
  if (data.data.length) {
    bandExist.value = true
    status.value = 'Группа уже имеется в базе'
  } else {
    bandExist.value = false
    status.value = 'Группы нет в базе'
    band.value = await answerWithBand(bandId)
    await axios.post('/api/bands', band.value)
    status.value = `Группа ${band.value.title} успешно добавлена в базу`
    chrome.action.setIcon({ path: '/icons/band-exist.png' })
  }
}

const parseAlbum = async () => {
  const albumId = Number(activeTab.value.url?.split('/').pop())
  status.value = 'Проверяю наличие альбома в базе'
  const { data } = await checkAlbumExist(albumId)

  if (data.data.length) {
    albumExist.value = true
    status.value = 'Альбом уже имеется в базе'
  } else {
    albumExist.value = false
    status.value = 'Альбома нет в базе'
    album.value = await answerWithAlbum(albumId)
    await axios.post('/api/albums', album.value)
    status.value = `Альбом ${album.value.title} успешно добавлен в базу`
    chrome.action.setIcon({ path: '/icons/band-exist.png' })
  }
}

onMounted(async () => {
  await setActiveTab()
  getIsBandPage()

  if (isBandPage.value) {
    parseBand()
  } else {
    parseAlbum()
  }
})
</script>


<style lang="scss">
.wrapper {
  width: 300px;
  height: 100%;
  background-color: #383838;
  font-size: medium;
  color: white;
}
</style>