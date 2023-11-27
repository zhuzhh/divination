<script setup lang="ts">
// import type { Ref } from 'vue'
import { onMounted } from 'vue'
import axios from 'axios'
// import { useRouter } from 'vue-router'
//
// const router = useRouter()
// const route = useRoute()
// const userInfo = ref('zzh')

const code = '0912SVGa1saYsG0Bl9Ha1izwtQ32SVGa'
const host = 'http://qiming.kongjiankeji.com/'

onMounted(() => {
  axios.get(`${host}zhouyi/wxpublic-num/login/${code}/2/session`)
    .then(res => {
      res = res.data
      // { code : 200, msg: '', data: 'wxOpenId'}
      if (+res?.code === 200) {
        localStorage.setItem('login_info', res.data)
        // router.replace({
        //   path: '/'
        // })
        window.location.reload('');
      } else {
        console.log('获取openid失败: ', res)
      }
    })
    .catch(err => {
      console.log('error: ', err)
    })
})

</script>

<template>
  <div class="login-wrap">
    <div class="btn">
      <a href="">登录</a>
    </div>
  </div>
</template>

<style scoped>

</style>
