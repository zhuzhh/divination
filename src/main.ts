import './assets/main.css'

import { createApp } from 'vue'
// import App from './App.vue'
import HomeView from './views/HomeView.vue'
// import router from './router'

// const app = createApp(App)
const app = createApp(HomeView)

// app.use(router)

app.mount('#app')

