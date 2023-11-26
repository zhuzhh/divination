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
  <div class="btn-wrap" v-show="!showAnimation" @click="btnClick">
    <img class="icon" src="../assets/bg.jpg" alt="">
    <div class="btn">{{ list.length < 6 ? '起卦' : '解卦' }}</div>
  </div>
  <div class="animation-wrap" :class="showAnimation ? 'show' : ''">
    <!--<div class="mask"></div>-->
    <div class="content">
      <img class="icon" :src="coins[0] ? front : back" alt="">
      <img class="icon" :src="coins[1] ? front : back" alt="">
      <img class="icon" :src="coins[2] ? front : back" alt="">
    </div>
  </div>
  <div class="tips-wrap" v-show="showTip" @click="tipClick">
    <span>卜卦要按起卦六次才能形成完整的卦象</span>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import { ref } from 'vue'
import front from '../assets/zhengmian.png'
import back from '../assets/fanmian.png'

const origin = ref(new Array(6).fill(-1))
const list: Ref<(0 | 1)[]> = ref([])
let coins: Ref<(0 | 1)[]> = ref([])
let showAnimation = ref(false)
console.log('localStorage.getItem(\'login_info\')', !!localStorage.getItem('login_info'))

let showTip = ref(!localStorage.getItem('login_info'))

const getRandom = (): 0 |1 => {
  return Math.random() > 0.5 ? 1 : 0
}
// https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfaf182e39798fc63&redirect_uri=http%3A%2F%2Fdevelopers.weixin.qq.com&response_type=code&scope=snsapi_base&state=STATE&uin=MTIwMDg0OTUxNQ%3D%3D&key=22614aef86399025569c3292dfbcdb62e471277bce57a583b078f8b96a0ad3416787e254db18b998c480ca597ce410c6&pass_ticket=C2+siAsckB3nCZ1+Vb/khVFABTOXitnuyW76qBZtyI+BY+D79yBbPm4ROqrq6x8Tkx+VamUhhRrQ7+BZON3PmupviyaXauukE1f0N20RqNw=&uin=MTIwMDg0OTUxNQ%3D%3D&key=ebc36c1e1a73bd88b9de1a68cf4a2f4a9a05169c57f9abe9fc4940fdb07d90daa86ce614dc1e8aab159bc948fea16eff&pass_ticket=C2+siAsckB3nCZ1+Vb/khVFABTOXitnuyW76qBZtyI+BY+D79yBbPm4ROqrq6x8TpU48ieLK6zuNQE3eHTHGn+Bx+o3Qz/nWBNoeIE1RWbU=
const btnClick = () => {
  if (list.value.length >= 6) {
    console.log('解卦....')
  } else {
    coins.value = [getRandom(), getRandom(), getRandom()]
    console.log('coins: ', coins.value)
    const sum: number = coins.value.reduce((pre: number, cur) => {
      return pre + (cur === 0 ? 2 : 1)
    }, 3)
    console.log('sum： ', sum)
    const res = sum % 2 === 0 ? 0 : 1
    showAnimation.value = true
    console.log(res)
    setTimeout(() => {
      list.value.push(res)
      setTimeout(() => {
        showAnimation.value = false
      }, 1500)
    }, 1000)
  }
}

const loginAction = () => {
  console.log('....login')
  window.open('https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfaf182e39798fc63&redirect_uri=.%2Flogin&response_type=code&scope=snsapi_base&state=123#wechat_redirect')
}

const tipClick = () => {
  showTip.value = false
  loginAction()
}
</script>

<style lang="less" scoped>
.bar-wrap {
  padding-bottom: 10px;
  display: flex;
  flex-direction: column-reverse;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: url("../assets/bg.jpg") no-repeat;
    background-size: 100% 100%;
    opacity: 0.2;
    z-index: -1;
  }
  //.bg {
  //  background: url("../assets/bg.jpg") no-repeat;
  //  opacity: 0.3;
  //}
}
.bar {
  margin-top: 20px;
  height: 38px;
  margin-left: 2rem;
  margin-right: 2rem;
}

.b-1 {
  //background-color: red;
}

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
  //border: 1px solid #df5151;
  //text-align: center;
  //padding: 6px;
  //color: #df5151;
  //margin: 2rem;
  margin-top: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .icon {
    width: 80px;
    height: 80px;
    display: inline-block;
    border-radius: 50%;
  }
  .btn {
    border: 1px solid #df5151;
    text-align: center;
    padding: 2px 12px;
    color: #df5151;
    margin: 1rem 2rem;
    border-radius: 6px;
  }
}

.animation-wrap {
  //position: fixed;
  //top: 0;
  //left: 0;
  //right: 0;
  //bottom: 0;
  margin-top: 56px;
  opacity: 0;
  //z-index: -1;
  //transition: opacity 300ms;
}
.animation-wrap.show {
  opacity: 1;
  //z-index: 100;
}
//.animation-wrap .mask {
//  width: 100%;
//  height: 100%;
//  display: block;
//  background-color: rgba(0, 0, 0, 0.3);
//}
.animation-wrap .content {
  //position: absolute;
  //z-index: 9999;
  //top: 200px;
  //left: 0;
  //margin-top: 10px;
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
  transform: scale(0.3);
  opacity: 0;
  transform-style: preserve-3d;
  perspective: 100px;
}
.animation-wrap.show .icon {
  transform: scale(1) rotateX(720deg);
  filter: blur(0px);
  opacity: 1;
}
.tips-wrap {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  span {
    display: inline-block;
    width: 60%;
    font-weight: bold;
    //color: #000;
  }
}

</style>
