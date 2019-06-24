const CONFIG = require('../config.js')
const API_BASE_URL = "https://api.it120.cc"

// 请求封装
const request = (url, needSubDomain, method, data) => {
  let _url = API_BASE_URL + (needSubDomain ? '/' + CONFIG.subDomain : '') + url
  return new Promise((resolve, reject) => {
    wx.request({
      url: _url,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success(request) {
        resolve(request.data)
      },
      fail(error) {
        reject(error)
      },
      complete(aaa) {
        // 加载完成
      }
    })
  })
}

  // 小程序promise扩展finally方法
Promise.prototype.finally = function (callback) {
  var Promise = this.constructor;
  return this.then(
    function (value) {
      Promise.resolve(callback()).then(
        function () {
          return value;
        }
      );
    },
    function (reason) {
      Promise.resolve(callback()).then(
        function () {
          throw reason;
        }
      );
    }
  );
}

  module.exports = {
    request,
    queryMobileLocation: (data) =>{
      return request('/common/mobile-segment/location', false, 'get', data)
    },
    // 权限判断
    vipLevel: () => {
      return request('/config/vipLevel', true, 'get')
    },
    // bananer图
    banners: (data) => {
      return request('/banner/list', true, 'get', data )
    },
    addTempleMsgFormid: (data) => {
      return request('template-msg/wxa/formId', true, 'post', data)
    },
    queryConfigBatch: (keys) => {
      return request('/config/values', true, 'get', { keys })
    },
    scoreRules: (data) => {
      return request('/score/send/rule', true, 'post', data)
    },
    checkToken: (token) => {
      // 检查token
      return request('/user/check-token', true, 'get', {
        token
      })
    },
    login: (code) => {
      return request('/user/wxapp/login', true, 'post', {
        code,
        type: 2
      })
    },
    register: (data) => {
      return request('/user/wxapp/register/complex', true, 'post', data)
    },
    addTempleMsgFormid: (data) => {
      return request('/template-msg/wxa/formId', true, 'post', data)
    },
    // 公告
    noticeList: (data) => {
      return request('/notice/list',true,'post',data)
    },
    noticeDetail: (id) => {
      return request('/notice/detail',true,'get',{id})
    },
    // 商品
    goodsCategory: () => {
      return request('/shop/goods/category/all',true,'get')
    },
    goods: (data) => {
      return request('/shop/goods/list',true,'post',data)
    },
    goodsDetail: (id) => {
      return request('/shop/goods/detail',true,'get',{id})
    },
    goodsReputation: (data) => {
      return request('/shop/goods/reputation', true, 'post', data)
    },
    kanjiaList: (data) => {
      return request('/shop/goods/kanjia/list', true, 'post', data)
    }
  }
