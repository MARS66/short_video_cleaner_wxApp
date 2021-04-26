
/**
 * GET请求封装
 */
function get(url, data = {}) {
  return request(url, data, 'GET')
}

/**
 * POST请求封装
 */
function post(url, data = {}) {
  return request(url, data, 'POST')
}
const axios={
  get(url, data = {}) {
    return request(url, data, 'GET')
  },
  post(url, data = {}) {
    return request(url, data, 'POST')
  }
}
/**
 * 微信的request
 */
function request(url, data = {}, method = "GET") {
  return new Promise(function(resolve, reject) {
    wx.request({
      url,
      data: data,
      method: method,
      header: {
      },
      success: function(res) {
        resolve(res);
      },
      fail: function(err) {
        wx.showToast({
          title: '小鱼被墙了o(╥﹏╥)o  请反馈告知小鱼Thanks♪(･ω･)ﾉ',
          icon: "none",
        })
        reject('被墙了o(╥﹏╥)o')
      },
    });
})
}

module.exports = {
  request,
  get,
  axios,
  post
}