//app.js
const WXAPI = require('./wxapi/main.js')

App({
  navigateToLogin: false,
  // 生命周期函数--监听小程序初始化
  onLaunch: function () {
    const that = this;
    // 检测新版本
    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用',
        success( res ) {
          if(res.confirm) {
            // 新版本已经下载好，调用applyUpdate应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    });

    // 初次加载判断网络情况，无网络状态下进行调整
    wx.getNetworkType({
      success: function(res) {
        const networkType = res.networkType
        console.log("网络测试："+networkType)
        if( networkType === 'none'){
          that.globalData.isConnected = false
          wx.showToast({
            title: '当前无网络',
            icon: 'loading',
            duration: 2000
          })
        }else{
          that.globalData.isConnected = true
          wx.hideToast()
        }
      }
    });
    // 监听网络状态变化
    wx.onNetworkStatusChange(function(res){
      if(!res.isConnected){
        that.globalData.isConnected = false
        wx.showToast({
          title: '网络已断开',
          icon: 'loading',
          duration: 2000,
          complete: function() {
            that.goStartIndexPage()
          }
        })
      }
    });

    //  获取接口和后台权限
    WXAPI.vipLevel().then(res => {
      that.globalData.vipLevel = res.data
    });
    //  获取配置
    WXAPI.queryConfigBatch('mallName,recharge_amount_min,ALLOW_SELF_COLLECTION').then(function (res) {
      if (res.code == 0) {
        res.data.forEach(config => {
          wx.setStorageSync(config.key, config.value);
          if (config.key === 'recharge_amount_min') {
            that.globalData.recharge_amount_min = res.data.value;
          }
        })
      }
    });
    WXAPI.scoreRules({
      code: 'goodReputation'
    }).then(function (res) {
      if (res.code == 0) {
        that.globalData.order_reputation_score = res.data[0].score;
      }
    })  
  },
  goLoginPageTimeOut: function(){
    if(this.navigateToLogin){
      return;
    }
    wx.removeStorageSync('token')
    this.navigateToLogin = true
    console.log('跳转登录页')
    setTimeout(function(){
      wx.navigateTo({
        url: '/pages/authorize/index',
      })
    },500)
  },
  goStartIndexPage: function () {
    setTimeout(function () {
      wx.redirectTo({
        url: "/pages/start/start"
      })
    }, 500)
  },  
  onShow (e) {
    const _this = this
    // 获取缓存token
    const token = wx.getStorageSync('token')
    if(!token){
      // 跳转到登录授权页
      console.log('跳转到登录授权页')
      _this.goLoginPageTimeOut()
      return
    }
    // 检查token
    WXAPI.checkToken(token).then(function(res){
      if(res.code != 0){
        wx.removeStorageSync('token')
        _this.goLoginPageTimeOut()
      }
    })
    wx.checkSession({
      fail() {
        _this.goLoginPageTimeOut()
      }
    })
    this.globalData.launchOption = e
    // todo 保存邀请码
  },
  globalData: {
    isConnected: true,
    launchOption: undefined,
    vipLevel: 0
  }
})