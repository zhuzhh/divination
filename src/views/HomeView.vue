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
      <div class="contain" style="position: relative;">
        <img class="zheng" :src="coins[0] ? front : back" alt="">
        <img class="fan" :src="coins[0] ? back : front" alt="">
      </div>
      <div class="contain">
        <img class="icon2 zheng" :src="coins[1] ? front : back" alt="">
        <img class="icon2 fan" :src="coins[1] ? back : front" alt="">
      </div>
      <div class="contain">
        <img class="icon3 zheng" :src="coins[2] ? front : back" alt="">
        <img class="icon3 fan" :src="coins[2] ? back : front"  alt="">
      </div>

<!--      <img class="icon" :src="coins[0] ? front : back" alt="">-->
<!--      <img class="icon" :src="coins[1] ? front : back" alt="">-->
<!--      <img class="icon" :src="coins[2] ? front : back" alt="">-->
    </div>
  </div>
  <div class="tips-wrap" v-show="showTip" @click="tipClick">
    <span>卜卦要按起卦六次才能形成完整的卦象</span>
  </div>
  <div class="detail-wrap" :class="showDetail ? 'show' : 'hide'">
    <div class="mask"></div>
    <div class="content-wrap" style="z-index: 99">
      <img class="img" :src="contentImg" alt="">
      <!--<img class="img" src="../assets/test.jpg" alt="">-->
      <div class="tip">
        <span style="color: #f00">注意:</span> 请妥善保存卦象释义,退出页面或关闭弹框后，则需要重新起卦
      </div>
      <div class="btn">
        <img src="../assets/close.png" class="close" alt="" @click="closeDetail">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import { ref } from 'vue'
import axios from 'axios'
import front from '../assets/zhengmian.png'
import back from '../assets/fanmian.png'

const origin = ref(new Array(6).fill(-1))
const list: Ref<(0 | 1)[]> = ref([])
let coins: Ref<(0 | 1)[]> = ref([])
let showAnimation = ref(false)
let showDetail = ref(false)
let contentImg = ref('')
const openId = localStorage.getItem('login_info')
const host = 'http://qiming.kongjiankeji.com/'
const appId = 'wxa6d79f458a0e21e8'

let showTip = ref(!openId)

const closeDetail = () => {
  showDetail.value = false
}

const getRandom = (): 0 | 1 => {
  return Math.random() > 0.5 ? 1 : 0
}

// 下单
const payAction = () => {
  axios.post(host + 'zhouyi/wx/pay/generate/order', {
    openId: localStorage.getItem('login_info')
  }).then(res => {
    console.log('pay success ', res)
    res = res.data
    if (+res.code === 200 && res.data) {
      getOrderStatusById(res.data.orderNum)
    } else {
      console.error(res.msg)
    }
  }).catch(err => {
    alert('下单失败!')
    console.log(err)
  })
}

let times = 10

// 获取订单状态
const getOrderStatusById = (orderNum: string, count = 0) => {
  // 轮询十次
  if (count >= times) return
  axios.get(host + `api/order/query/${orderNum}`)
    .then(res => {
      res = res.data
      if (+res.code === 200) {
        getDetail()
      } else {
        setTimeout(() => {
          getOrderStatusById(orderNum, count++)
        }, 2000)
      }
    })
    .catch(err => {
      console.error(err)
      setTimeout(() => {
        getOrderStatusById(orderNum, count++)
      }, 2000)
    })
}

// 解卦
const getDetail = () => {
  axios.get(host + `api/divination/query/${list.value.join()}`)
    .then(res => {
      res = res.data
      if (+res.code === 200 && res.data) {
        contentImg.value = res.data.divinationExplainUrl
        showDetail.value = true
      } else {
        console.error(res)
        alert('获取解卦详情失败，请稍后重试!!!')
      }
    })
    .catch(err => {
      console.error(err)
      alert('获取解卦详情失败，请稍后重试!!!')
    })
}

const btnClick = () => {
  if (list.value.length >= 6) {
    console.log('解卦....')
    payAction()
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
  let redirectUri = encodeURIComponent('http://qiming.kongjiankeji.com/login.html')
  // let redirectUri = encodeURIComponent('http://6789.kongjiankeji.com/index.html')
  let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base&state=123#wechat_redirect`;
  console.info('url', url)
  window.open(url)
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
  margin-top: 26px;
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
  background-color: rgba(0, 0, 0, 0.6);
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

.detail-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translateX(-100%);
  z-index: 100;
  overflow: hidden;
  &.show {
    transform: translateX(0);
  }
  .mask {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    position: absolute;
    bottom: 0;
    z-index: -1;
  }
  .content-wrap {
    //position: absolute;
    //top: 0;
    //left: 0;
    //width: 100%;
    ////top: 50%;
    ////left: 50%;
    ////transform: translate(-50%, -50%);
    ////width: 100%;
    //display: flex;
    //align-items: center;
    //justify-content: center;
    //flex-direction: column;
    //display: gird;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80%;
    max-width: 295px;
    transform: translate(-50%, -50%);
    margin: 10px 0;
    .img {
      width: 100%;
    }
    .tip {
      //padding-top: 10px;
      //color: #ed4e4c;
      color: #fff;
      font-size: 10px;
      font-weight: bold;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 20px auto 0;
      .close {
        width: 20px;
      }
    }
  }
}

.animation-wrap.show  {
  .zheng {
    animation: turn 2.5s infinite;
  }
  .fan {
    animation: turn 2.5s infinite;
  }
}
.contain {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 10px;
  .zheng {
    position: absolute;
    z-index: 5;
    backface-visibility: hidden;
    width: 80px;
    height: 80px;
    transform-origin: left center;
    transform-style: preserve-3d;
    perspective: 100px;
    //animation-fill-mode: forwards;
  }
  .fan {
    position: absolute;
    width: 80px;
    height: 80px;
    transform-origin: left center;
    transform-style: preserve-3d;
    perspective: 100px;
    //animation-fill-mode: forwards;
  }
  //.icon2 {
  //  animation-delay:100ms;
  //}
  //.icon3 {
  //  animation-delay:200ms;
  //}
}

@keyframes turn {
  0% {
    transform: rotateX(0deg);
  }
  40% {
    transform: rotateX(720deg);
  }
  100% {
    transform: rotateX(720deg);
  }
}

</style>
