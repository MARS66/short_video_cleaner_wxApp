// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    wx.cloud.init()
  },
  globalData: {
    userInfo: null,
    server:'https://tools.qysf.xyz/'
  }
})
