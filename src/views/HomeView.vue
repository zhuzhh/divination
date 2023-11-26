<script setup lang="ts">
import type { Ref } from 'vue'
import { ref } from 'vue'
import front from './assets/zhengmian.png'
import back from './assets/fanmian.png'

const origin = ref(new Array(6).fill(-1))
const list: Ref<(0 | 1)[]> = ref([])
let coins: Ref<(0 | 1)[]> = ref([])
let showAnimation = ref(false)

const getRandom = (): 0 |1 => {
  return Math.random() > 0.5 ? 1 : 0
}

const btnClick = () => {
  if (list.value.length >= 6) {
    console.log('解卦....')
  } else {
    coins.value = [getRandom(), getRandom(), getRandom()]
    console.log('coins: ', coins.value)
    const sum: number = coins.value.reduce((pre: number, cur) => {
      return pre + cur
    }, 0)
    const res = sum % 2 === 0 ? 1 : 0
    showAnimation.value = true
    console.log(res)
    setTimeout(() => {
      list.value.push(res)
      setTimeout(() => {
        showAnimation.value = false
      }, 1000)
    }, 2000)
  }
}
</script>

<template>
  <div class="bar-wrap">
    <div
        class="bar"
        :class="list[index] === 1 ? 'b1' : list[index] === 0 ? 'b0' : 'b-1'"
        v-for="(item, index) in origin">
      <div class="half"></div>
      <div class="half"></div>
    </div>
  </div>
  <div class="btn-wrap" @click="btnClick">
    {{ list.length < 6 ? '起卦' : '解卦' }}
  </div>
  <div class="animation-wrap" :class="showAnimation ? 'show' : ''">
    <div class="mask"></div>
    <div class="content">
      <img class="icon" :src="coins[0] ? front : back" alt="">
      <img class="icon" :src="coins[1] ? front : back" alt="">
      <img class="icon" :src="coins[2] ? front : back" alt="">
    </div>
  </div>
</template>

<style scoped>
.bar-wrap {
  margin-top: 10px;
  margin-bottom: 60px;
  display: flex;
  flex-direction: column-reverse;
}
.bar {
  margin-bottom: 30px;
  height: 38px;
}
/*.b-1 {*/
/*  background-color: #cfcdcd;*/
/*}*/
.bar.b1 {
  background-color: #ed4e4c;
}

.half {
  opacity: 0;
  width: 45%;
  height: 100%;
  background-color: #393739;
  /* transform: all 1s; */
}
.b0 {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.b0 .half {
  opacity: 1;
}
.btn-wrap {
  border: 1px solid #df5151;
  text-align: center;
  padding: 6px;
  color: #df5151;
}

.animation-wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  z-index: -1;
  transform: opacity 300ms;;
}
.animation-wrap.show {
  opacity: 1;
  z-index: 100;
}
.animation-wrap .mask {
  width: 100%;
  height: 100%;
  display: block;
  background-color: rgba(0, 0, 0, 0.3);
}
.animation-wrap .content {
  position: absolute;
  z-index: 9999;
  top: 200px;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.animation-wrap .icon {
  width: 80px;
  height: 80px;
  margin: 0 10px;
  display: block;
  transition: all 1s;
  transform-origin: center center;
  filter: blur(20px);
  /* transform: scale(0.3); */
  opacity: 0;
  transform-style: preserve-3d;
}
.animation-wrap.show .icon {
  /* .animation-wrap .icon:hover { */
  transform: scale(1) rotateY(720deg);
  filter: blur(0px);
  opacity: 1;
  /* transform: rotateZ(1440deg); */
}

</style>
