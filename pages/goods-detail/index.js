const WXAPI = require('../../wxapi/main.js')
const WxParse = require('../../wxParse/wxParse.js')
const regeneratorRuntime = require('../../utils/runtime')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsDetail: {},
    swiperCurrent: 0,
    hasMoreSelect: false,
    selectSize: "选择",
    selectSizePrice: 0,
    totalScoreToPay: 0,
    shopNum: 0,
    hideShopPopup: true,
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 0,

    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false, // 选中规格尺寸时候是否允许加入购物车
    shopCarInfo: {},
    shopType: "addShopCar", // 购物类，加入购物车或立即购买，默认为加入购物车
    currentPages: undefined,

    openShare: false
  },


  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(e) {
    if(e && e.scene) {
      const scene = decodeURIComponent(e.secne) // 处理扫码进商品详情页面逻辑
      if(scene) {
        e.id = secne.split(',')[0]
        wx.setStorageSync('referrer', scene.split(',')[1])
      }
    }
    this.data.goodsId = e.id
    const that = this
    this.data.kjJoinUid = e.kjKoinUid
    wx.getStorage({
      key: 'shopCarinfo',
      success: function(res) {
        that.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum,
          curuid: wx.getStorageSync('uid')
        });
      },
    });
    this.reputation(e.id)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getGoodsDetailAndKanjiaInfo(this.data.goodsId)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let _data = {
      title: this.data.goodsDetail.basicInfo.name,
      path: '/pages/goods-detail/index?id=' +this.goodsDetail.basicInfo.id + '&inviter_id=' + wx.getStorageSync('uid'),
      success: function(res) {
        //转发成功
      },
      fail: function(res){
         // 转发失败
      }
    }
    if(this.data.kjJoinUid) {
      _data.title = this.data.curKanjiaProgress.joiner.nick + '邀请您帮TA砍价'
      _data.path += '$kjJoinUid=' + this.data.kjJoinUid
    }
    return _data
  },
  // 轮播切换
  swiperchange: function(e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  // 评价
  reputation: function(goodsId) {
    var that = this;
    WXAPI.goodsReputation({
      goodsId: goodsId
    }).then(function(res){
      if(res.code == 0){
        that.setData({
          reputation: res.data
        });
      }
    });
  },
  // 获取商品详情
  async getGoodsDetailAndKanjiaInfo(goodsId) {
    const that = this;
    const goodsDetailRes = await WXAPI.goodsDetail(goodsId);
    if(goodsDetailRes.code == 0){
      var selectSizeTemp = "";
      if(goodsDetailRes.data.properties) {
        for(var i = 0; i < goodsDetailRes.data.properties.length; i++){
          selectSizeTemp = selectSizeTemp + " " + goodsDetailRes.data.properties[i].name;
        }
        that.setData({
          hasMoreSelect: true,
          selectSize: that.data.selectSize + selectSizeTemp,
          selectSizePrice: goodsDetailRes.data.basicInfo.minPrice,
          totalScoreToPay: goodsDetailRes.data.basicInfo.minScore
        });
      }
      that.data.goodsDetail = goodsDetailRes.data;
      if(goodsDetailRes.data.basicInfo.videoId){
        that.setVideoSrc(goodsDetailRes.data.basicInfo.videoId);
      }

      let _data = {
        goodsDetail: goodsDetailRes.data,
        selectSizePrice: goodsDetailRes.data.basicInfo.minPrice,
        totalScoreToPay: goodsDetailRes.data.basicInfo.minScore,
        buyNumMax: goodsDetailRes.data.basicInfo.stores,
        buyNumber: (goodsDetailRes.data.basicInfo.stores > 0) ? 1 : 0,
        currentPages: getCurrentPages()
      }
    that.setData(_data)
    WxParse.wxParse('article', 'html', goodsDetailRes.data.content, that, 5);
    }
  },
  // 分享
  openShareDiv() {
    this.setData({
      openShare: true
    });
  },
  // 规格选择弹出框
  bindGuiGeTap: function() {
    this.setData({
      hideShopPopup:false
    })
  },
  // 去购物车
  goShopCar: function(){
    wx.reLaunch({
      url: '/pages/shop-cart/index',
    })
  },
  // 添加购物车
  toAddShopCar: function(){
    console.log("加入购物车")
    this.setData({
      shopType: "addShopCar"
    });
    this.bindGuiGeTap();
  },
  // 去购买
  toBuy: function(){
    console.log('立即购买')
    this.setData({
      shopType: 'tobuy',
      selectSizePrice: this.data.goodsDetail.basicInfo.minPrice
    });
    this.bindGuiGeTap();
  },
  // 规格选择弹出框隐藏
  closePopupTap:function(){
    this.setData({
      hideShopPopup:true
    });
  },
  // 商品数量增
  numJianTap: function(){
    if(this.data.buyNumber > this.data.buyNumMin){
      var currentNum = this.data.buyNumber;
      currentNum--;
      this.setData({
        buyNumber: currentNum
      });
    }
  },
  // 商品数量减
  numJiaTap: function(){
    if(this.data.buyNumber < this.data.buyNumMax){
      var currentNum = this.data.buyNumber;
      currentNum++;
      this.setData({
        buyNumber: currentNum
      });
    }
  },
  // 加入购物车
  addShopCar: function() {
    if(this.data.goodsDetail.properties && !this.data.canSubmit) {
      if(!this.data.canSubmit){
        wx.showModal({
          title: '提示',
          content: '请选择商品规格',
          showCancel:false
        })
      }
      this.bindGuiGeTap();
      return;
    }
    if(this.data.buyNumber < 1){
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0',
        showCancel:false
      })
    }
    // 组建购物车
    var shopCarInfo = this.bulidShopCarInfo();
    this.setData({
      shopCarInfo: shopCarInfo,
      shopNum: shopCarInfo.shopNum
    });

    // 写入本地存储
    wx.setStorage({
      key: 'shopCarInfo',
      data: shopCarInfo,
    });
    this.closePopupTap();
    wx.showToast({
      title: '加入购物车成功',
      icon:'success',
      duration:2000
    });
  
  },
  // 现在购买
  buyNow: function(e){
    let that = this;
    let shoptype = e.currentTarget.dataset.shoptype;
    console.log(shoptype)
    if(this.data.goodsDetail.properties && !this.data.canSubmit) {
      if(!this.data.canSubmit){
        wx.showModal({
          title: '提示',
          content: '请选择商品规格',
          showCancel:false
        })
      }
      this.bindGuiGeTap();
      wx.showModal({
        title: '提示',
        content: '请先选择规格尺寸',
        showCancel: false
      })
      return;
    }
    if(this.data.buyNumber < 1){
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0',
        showCancel: false
      })
      return;
    }
    // 组建立即购买信息
    var buyNowInfo = this.buildBuyNowInfo(shoptype);
    wx.setStorage({
      key: 'buyNowInfo',
      data: buyNowInfo,
    });
    this.closePopupTap();
    // 跳转支付页
    wx.navigateTo({
      url: '/pages/to-pay-order/index?orderType=buyNow',
    })
  },
  // 组建购物车信息
  bulidShopCarInfo: function(){
    var shopCarMap = [];

  }
})