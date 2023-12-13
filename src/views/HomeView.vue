<template>
  <div class="title-wrap">
    <span v-if="title">{{title}}</span>
  </div>
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
      <img v-for="item in contentImgs" class="img" :src="item" wx:key="item" alt="">
      <!--<img class="img" src="../assets/test.jpg" alt="">-->
      <div class="tip">
        <span style="color: #f00">注意:</span> 请妥善保存卦象释义,退出页面或关闭弹框后，则需要重新起卦
      </div>
      <div class="btn">
        <img src="../assets/close2.png" class="close" alt="" @click="closeDetail">
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
let contentImgs = ref([])
const openId = localStorage.getItem('login_info')
const host = 'https://qiming.kongjiankeji.com/'
const appId = 'wxa6d79f458a0e21e8'

console.log('openId: ', openId)
let showTip = ref(!openId)
let title = ref('')

let detailInfo = {}
let timer = null

console.log(window.location.href)

const closeDetail = () => {
  showDetail.value = false
  list.value.length = 0
  title.value = ''
  detailInfo = {}
}

const getRandom = (): 0 | 1 => {
  return Math.random() > 0.5 ? 1 : 0
}

// 下单
const payAction = () => {
  axios.post(host + 'zhouyi/wx/pay/generate/order', {
    openId: localStorage.getItem('login_info')
  }).then(res => {
    res = res.data
    console.log('pay success ', res)
    if (+res.code === 200 && res.data) {
      getDetail()
      wxPay(res.data)
    } else {
      console.error(res)
      alert('获取解卦信息失败!')
    }
  }).catch(err => {
    alert('下单失败!')
    console.log(err)
  })
}

const wxPay = (params) => {
  function onBridgeReady() {
    console.log('orderParams: ', JSON.stringify(params))
    WeixinJSBridge.invoke('getBrandWCPayRequest', {
      "appId": appId,   //公众号ID，由商户传入
      "timeStamp": params.timeStamp + "",   //时间戳，自1970年以来的秒数
      "nonceStr": params.nonceStr,      //随机串
      "package": params.packages,
      "signType": params.signType,     //微信签名方式：
      "paySign": params.paySign //微信签名
    },
    function(res) {
      console.error('wxPay: ', res)
      if (res.err_msg == "get_brand_wcpay_request:ok") {
        // 使用以上方式判断前端返回,微信团队郑重提示：
        // res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
      }
      clearTimeout(timer)
      timer = null
      getOrderStatusById(params.outTradeNo)
    });
  //  scp -r dist/* root@182.92.157.104:/home/www/zhouyi/zhouyih5
  }
  if (typeof WeixinJSBridge == "undefined") {
    if (document.addEventListener) {
      document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
    } else if (document.attachEvent) {
      document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
      document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
    }
  } else {
    onBridgeReady();
  }

}

let times = 10

// 获取订单状态
const getOrderStatusById = (orderNum: string, count = 0) => {
  console.log('查询订单状态: ', orderNum)
  console.log('查询订单状态 count: ', count)
  // 轮询十次
  if (count >= times) return
  axios.get(host + `zhouyi/wx/pay/query/${orderNum}`)
    .then(res => {
      console.log('res: ', res)
      res = res.data
      if (+res.code === 200) {
        showDialogImg()
      } else {
        timer = setTimeout(() => {
          getOrderStatusById(orderNum, ++count)
        }, 2000)
      }
    })
    .catch(err => {
      console.error(err)
      timer = setTimeout(() => {
        getOrderStatusById(orderNum, ++count)
      }, 2000)
    })
}

const data = {"msg": "操作成功", "code": 200, "data": {"createBy": null, "createTime": null, "updateBy": null, "updateTime": null, "remark": null, "id": 260, "divinationName": "未济", "divinationTitle": "未济卦第六十四 火水未济", "divinationAttribute": "离宫三世", "divination": "离上 坎下", "divinationValue": "010101", "divinationFirst": "0", "divinationFirstChineseEra": "戊寅", "divinationFirstParaphrase": "父母", "divinationFirstOtherParaphrase": null, "divinationFirstDescription": "上九：有孚于饮酒，无咎；濡其首，有孚，失是。", "divinationSecond": "1", "divinationSecondChineseEra": "戊辰", "divinationSecondParaphrase": "子孙", "divinationSecondOtherParaphrase": null, "divinationSecondDescription": "六五：贞吉，无悔；君子之光，有孚，吉。", "divinationThird": "0", "divinationThirdChineseEra": "戊午", "divinationThirdParaphrase": "兄弟", "divinationThirdOtherParaphrase": "世", "divinationThirdDescription": "九四：贞吉，悔亡；震用伐鬼方，三年有赏于大国。", "divinationFour": "1", "divinationFourChineseEra": "己酉", "divinationFourParaphrase": "妻财", "divinationFourOtherParaphrase": null, "divinationFourDescription": "六三：未济，征凶，利涉大川。", "divinationFive": "0", "divinationFiveChineseEra": "己未", "divinationFiveParaphrase": "子孙", "divinationFiveOtherParaphrase": null, "divinationFiveDescription": "九二：曳其轮，贞吉。", "divinationSix": "1", "divinationSixChineseEra": "己巳", "divinationSixParaphrase": "兄弟", "divinationSixOtherParaphrase": "应", "divinationSixDescription": "初六：濡其尾，吝。", "divinationExplainUrl": "/profile/upload/2023/11/30/未济.png",
    "divinationExplainUrls": [
        "/profile/upload/2023/11/30/未济.png",
        "/profile/upload/2023/11/30/未济.png",
        "/profile/upload/2023/11/30/未济.png"
    ], "divinationDescription": "亨；小狐汔济，濡其尾，无攸利。", "status": "0", "delFlag": "0"}}

const test = () => {
  contentImgs.value = (data.data.divinationExplainUrls || []).map((item: string) => {
    const url = host + 'zhouyi' + item
    console.log('image src ', url)
    return url
  })
  title.value = data.data.divinationName
  showDetail.value = true
}

const showDialogImg = () => {
  const res = detailInfo
  contentImgs.value = (res.data.divinationExplainUrls || []).map((item: string) => {
    const url = host + 'zhouyi' + item
    console.log('image src ', url)
    return url
  })
  showDetail.value = true
}

const getDetail = () => {
  console.log('getDetail: ', host + `zhouyi/api/divination/query/${list.value.join('')}`)
  return new Promise((resolve, reject) => {
    axios.get(host + `zhouyi/api/divination/query/${list.value.join('')}`)
      // axios.get(host + `zhouyi/api/divination/query/001010`)
      .then(res => {
        res = res.data
        console.log('detail: ', res)
        if (+res.code === 200 && res.data) {
          title.value = res.data.divinationName
          detailInfo = res
          resolve(res.data)
        } else {
          console.error(res)
          alert('获取解卦详情失败，请稍后重试!!!')
          reject(res)
        }
      })
      .catch(err => {
        reject(err)
        console.error(err)
        alert('获取解卦详情失败，请稍后重试!!!')
      })
  })
}

const btnClick = () => {
  if (list.value.length >= 6) {
    console.log('解卦....')
    payAction()
    // test()
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
      if (list.value.length === 6) {
        setTimeout(() => {
          detailInfo = {}
          getDetail()
        }, 0)
      }
    }, 1000)
  }
}

const loginAction = () => {
  console.log('....login')
  let redirectUri = encodeURIComponent('https://qiming.kongjiankeji.com/h5/login.html')
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
.title-wrap {
  text-align: center;
  padding: 16px 0;
  height: 102px;
  span {
    //max-width: 2em;
    //padding: 0 26px;
    width: 150px;
    height: 70px;
    line-height: 1.45;
    font-size: 48px;
    font-weight: bold;
    display: inline-block;
    background: #ed4e4c;
    color: #fff;
    border-radius: 70px / 35px;
  }
}
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
    opacity: 0.03;
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
  margin-top: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .icon {
    width: 120px;
    height: 120px;
    display: inline-block;
    border-radius: 50%;
  }

  .btn {
    width: 150px;
    height: 70px;
    line-height: 1.45;
    border: 1px solid #df5151;
    text-align: center;
    //padding: 0 26px;
    //line-height: 1.3;
    font-size: 48px;
    font-weight: bold;
    background-color: #df5151;
    color: #fff;
    margin: 1rem 2rem;
    border-radius: 70px / 35px;
  }
}

.animation-wrap {
  margin-top: 56px;
  opacity: 0;
}

.animation-wrap.show {
  opacity: 1;
  //z-index: 100;
}

.animation-wrap .content {
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
    background-color: rgba(0, 0, 0, 0.8);
    position: absolute;
    bottom: 0;
    z-index: -1;
  }
  .content-wrap {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80%;
    max-width: 295px;
    transform: translate(-50%, -50%);
    margin: 10px 0;
    padding: 20px 0 40px;
    max-height: 100%;
    overflow: scroll;
    .img {
      width: 100%;
      background: #fff;
      padding: 4px;
      margin-bottom: 12px;
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
