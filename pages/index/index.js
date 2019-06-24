const WXAPI = require('../../wxapi/main.js')
const CONFIG = require('../../config.js')
var app = getApp();
Page({
  /**
    * 页面的初始数据
    */
  data: {
    inputShowed: false, // 是否显示搜索框
    inputVal: "", // 搜索框内容
    category_box_width: 750, //分类总宽度
    goodsRecommend: [], // 推荐商品
    kanjiaList: [], //砍价商品列表
    pingtuanList: [], //拼团商品列表
    kanjiaGoodsMap: {}, //砍价商品列表

    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: false, // loading
    userInfo: {},
    swiperCurrent: 0,
    selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],

    scrollTop: 0,
    loadingMoreHidden: true,

    coupons: [],

    curPage: 1,
    pageSize: 20,
    cateScrollTop: 0
  },
 

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    wx.showShareMenu({
      withShareTicket: true
    });
    const that = this
    if(e && e.scene){
      const scene = decodeURIComponent(e.scene)
      if(scene) {
        wx.setStorageSync('referrer', scene.substring(11))
      }
    }
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName'),
    })
    // 商品轮播图
    WXAPI.banners({
      type: 'new'
    }).then(function(res){
      if(res.code == 700) {
        wx.showModal({
          title: '提示',
          content: '请在后台添加banner轮播图片，自定义类型为new',
          showCancel: false
        })
      }else{
        that.setData({
          banners: res.data
        });
      }
    }).catch(function(e){
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
    });
    // 获取商品类别
    WXAPI.goodsCategory().then(function(res){
      let categories = [];
      if(res.code == 0){
        categories = categories.concat(res.data)
      }
      // const _n = 150 * Math.ceil(categories.length / 2)
      // console.log(_n)
      // const _n = 150 * Math.ceil(categories.length)
      that.setData({
        categories: categories,
        // category_box_width: _n,
        activeCategoryId: 0,
        curPage: 1
      });
      that.getGoodsList(0);
    });
    // 获取爆品商品
    WXAPI.goods({
      recommendStatus:1
    }).then(res => {
      if(res.code === 0){
        that.setData({
          goodsRecommend: res.data
        });
      }
    });
    // 获取公告
    that.getNotice()
    // 获取砍价商品
    that.kanjiaGoods()
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

  },
   // 搜索框事件
  toSearch: function(){
    this.setData({
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  showInput: function() {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function() {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function(){
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function(e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
  // 公告
  getNotice: function() {
    console.log('进入公告')
    var that = this;
    WXAPI.noticeList({pageSize: 5}).then(function(res){
      if(res.code == 0){
        that.setData({
          noticeList: res.data
        })
      }
    });
  },
  // 商品类别
  tabClick: function(e){
    let offset = e.currentTarget.offsetLeft;
    if(offset > 150) {
      offset = offset - 150;
    }else {
      offset = 0;
    }
    this.setData({
      activeCategoryId: e.currentTarget.id,
      curPage: 1,
      cateScrollTop: offset
    });
    this.getGoodsList(this.data.activeCategoryId)
  },
  // 商品轮播
  swiperchange: function(e) {
    this.setData({
      swiperCurrent: e.detail.current
    });
  },
  tapBanner: function(e) {
    if(e.currentTarget.dataset.id != 0){
      wx.navigateTo({
        url: '/pages/goods-detail/index?id='+e.currentTarget.dataset.id,
      })
    }
  },
  // 爆品推荐
  toDetailsTap: function(e) {
    wx.navigateTo({
      url: '/pages/goods-detail/index?id=' + e.currentTarget.dataset.id,
    })
  },
  // 砍价商品
  kanjiaGoods(){
    const _this = this
    WXAPI.kanjiaList().then(function(res){
      if(res.code == 0){
        _this.setData({
          kanjiaList: res.data.result,
          kanjiaGoodsMap:res.data.goodsMap
        })
      }
    })
  },
  // 获取商品列表
  getGoodsList: function(categoryId, append){
    if(categoryId == 0){
      categoryId = "";
    }
    var that = this
    wx.showLoading({
      "mask":true
    });
    WXAPI.goods({
      categoryId:categoryId,
      nameLike: that.data.inputVal,
      page: this.data.curPage,
      pageSize: this.data.pageSize
    }).then(function(res){
      wx.hideLoading();
      if(res.code == 404 || res.code == 700){
        let newData = {
          loadingMoreHidden: false
        }
        if(!append) {
          newData.goods = []
        }
        that.setData(newData);
        return
      }
      let goods = [];
      if(append) {
        goods = that.data.goods
      }
      for(var i = 0; i < res.data.length; i++) {
        goods.push(res.data[i]);
      }
      that.setData({
        loadingMoreHidden: true,
        goods: goods,
      });
    });
  },
})