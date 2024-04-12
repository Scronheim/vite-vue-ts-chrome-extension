<template>
  <div class="wrapper">
    <img :src="band.photoUrl" width="300" />
    <ul v-if="!bandExist">
      <li>{{ band.title }}</li>
      <li>{{ band.country }} ({{ band.city }})</li>
      <li>{{ band.genre }}</li>
      <li>{{ band.lyricsTheme }}</li>
    </ul>

    {{ status }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'


import { answerWithBand, checkBandExist } from './requests/index'

import type { Band } from './types'


const band: Band = ref({})
const status = ref('')
const bandExist = ref(false)

const parse = async () => {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  const bandId = Number(tab.url?.split('/').pop())
  status.value = 'Проверяю наличие группы в базе'
  const { data } = await checkBandExist(bandId)
  if (data.data.length) {
    bandExist.value = true
    status.value = 'Группа уже имеется в базе'
  } else {
    bandExist.value = false
    status.value = 'Группы нет в базе. Начинаю процесс добавления'
    band.value = await answerWithBand(bandId)
    await axios.post('/api/bands', band.value)
    status.value = `Группа ${band.value.title} успешно добавлена в базу`
    chrome.action.setIcon({ path: '/icons/band-exist.png' })
  }
}

onMounted(() => {
  parse()
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