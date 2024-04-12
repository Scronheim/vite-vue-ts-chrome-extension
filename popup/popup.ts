import { createApp } from 'vue'
import axios from 'axios'

import App from './popup.vue'

axios.defaults.baseURL = 'http://185.125.202.224:3000'

createApp(App).mount('#app')
