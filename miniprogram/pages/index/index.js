// index.js
// 获取应用实例
const {globalData} = getApp()
import {axios} from '../../utils/util'
Page({
  data: {
    link:'',
    showLoading:false,
    loadText:'加载中 ···',
    share:false,
    downloadAddr:'',
    progress:'',
    playAddr:'',
    supports:['../../image/douyin.jpg','../../image/huoshang.jpg','../../image/kuaishou.jpg' ,'../../image/ticktok.jpg','../../image/pipi.jpg']
  },
  onLoad() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    })
  },
  setLocalStorge(num,time){
    wx.setStorageSync('times', {num,time})
  },
  onShareAppMessage(data) {
   this.share();
    const promise = new Promise(resolve => {
      setTimeout(() => {
        resolve({
          title: '免费去水印神器'
        })
      }, 200)
    })
    return {
      title: '免费去水印神器',
      path: '/page/index',
      promise 
    }
  },
  async cheakTimes(){
      const {num,time} =  await wx.getStorageSync('times')
        if (!time) {
        this.setLocalStorge(1,1)
          return false;
        }
        if (time*5+5<=num) {
        return true;
        }else{
          this.setLocalStorge(num+1,time)
          return false;
        }
  },
  close(){
    this.setData({  share:false, })
  },
  async share(){
    this.setData({  share:false, })
    const {time} =  await wx.getStorageSync('times')
    this.setLocalStorge(0,time+1)
  },
  bindKeyInput({detail:{value}}){
    if(value)this.setData({ link:value.trim()});
  },
  //  自动处理
  async autoDeel({currentTarget:{dataset:{type}}}){
    if (!this.data.link) {
      wx.showToast({
        title: '请先粘贴视频链接!',
        icon:'none'
      })
      return;
    }
   const isshare = await this.cheakTimes()
   if (isshare) {
     this.setData({  share:true, })
     return;
   }
   this.setData({  showLoading:true, })
    const func= type==='download'?'getLoadAdress':'showAdress'
    const url=`${globalData.server}video/fetch?type=auto&url=${this.data.link}`
    axios.get(url).then(({data,statusCode})=>{
      if (statusCode===200) {
        this[func](data)
        return;
      }
      this.setData({  showLoading:false, })
      if (statusCode===400) {
        wx.showToast({
          title: '错误视频链接，请重新复制链接！',
          icon:'none'
        })
        return;
      }
      wx.showToast({
        title: '小鱼心情不好o(╥﹏╥)o 等下再来！',
        icon:'none'
      })
    })
  },
  showAdress(url){
   this.setData({
      downloadAddr:url,
      showLoading:false
  })
  },
  // 复制链接
  copy({currentTarget:{dataset:{text}}}){
    wx.setClipboardData({
      data: text,
      success(res){
        wx.showToast({
          title: '链接已复制',
          icon:'none'
        })
      }
    })
  },
   // 复制邮箱
  copyEmail({currentTarget:{dataset:{text}}}){
    wx.setClipboardData({
      data: text,
      success(res){
        wx.showToast({
          title: '邮箱已复制',
          icon:'none'
        })
      }
    })
  },
 //检查授权
 baseAuthSet(url) {
  let self = this;
  wx.getSetting({ //获取用户当前的授权状况
    success: res => {
      let recordAuth = res.authSetting["scope.writePhotosAlbum"];
      if (recordAuth === true) { //1.已经授权成功，直接调用下载方法
        wx.getSavedFileList({  // 获取文件列表
          success(res) {
            res.fileList.forEach((val, key) => { // 遍历文件列表里的数据
              // 删除存储的垃圾数据
              wx.removeSavedFile({
                filePath: val.filePath
              });
            })
          }
        })
        this.handlerDowload(url)
       } else if (recordAuth === false) { //2.申请过授权，但用户不同意，打开手机系统设置
        self.openAuth();
      } else {  //3.从未授权，弹出授权窗口
        wx.authorize({
          scope: "scope.writePhotosAlbum",
          success: () => {  //授权成功
            //页面提示授权成功
          },
          fail: () => { //授权失败
            self.msg("text", "授权失败，请重试");
          }
        });
      }
    }
  });

},
getLoadAdress(url){
  wx.cloud.callFunction({
    // 要调用的云函数名称
    name: 'getLoadAdress',
    // 传递给云函数的event参数
    data: {
      url,
    }
  }).then(({result:{code,url}}) => {
   if (code===200) {
    this.handlerDowload(url)
    return;
   } 
   this.setData({  showLoading:false, })
    wx.showToast({
      title: '请稍后重试！',
      icon:'none'
    })
  }).catch(err => {
    this.setData({  showLoading:false, })
    wx.showToast({
      title: '请稍后重试！',
      icon:'none'
    })
  })
},

handlerDowload(url){
  const vm = this;
  let fileName = new Date().valueOf();
  const downloadTask= wx.downloadFile({
    url,
    header:{
     'Content-Type': 'application/octet-stream'
    },
    filePath: wx.env.USER_DATA_PATH + '/' + fileName + '.mp4',
    success: res => {
      let filePath = res.filePath;
      vm.saveVideo(filePath,fileName);
      },
    fail: err => {
      vm.setData({  
        showLoading:false, 
        progress:0,
        loadText:'加载中 ···'
      })
      wx.showModal({
        title: '提示',
        content: err.errMsg,
      })
    },
  })
  downloadTask.onProgressUpdate((res) => {
    vm.setData({
      progress:res.progress,
      loadText:'正在下载 ···'
    })
  })
},
saveVideo(filePath,fileName){
  const vm=this;
  wx.saveVideoToPhotosAlbum({
    filePath,
    success: () => {
      let fileMgr = wx.getFileSystemManager();
      fileMgr.unlink({
        filePath: wx.env.USER_DATA_PATH + '/' + fileName + '.mp4',
        success: function (r) {
          vm.setData({  
            showLoading:false, 
            progress:0,
            loadText:'加载中 ···'
          })
          wx.showToast({
            title: '视频已保存',
          })
        },
      })
    },
    fail: err => {
      vm.setData({  
        showLoading:false, 
        progress:0,
        loadText:'加载中 ···'
      })
      if (err.errMsg === 'saveVideoToPhotosAlbum:fail auth deny') {
        wx.showModal({
          title: '提示',
          content: '需要您授权保存相册',
          showCancel: false,
          success: data => {
            wx.openSetting({
              success(settingdata) {
                if (settingdata.authSetting['scope.writePhotosAlbum']) {
                  wx.showModal({
                    title: '提示',
                    content: '获取权限成功,再次点击下载即可保存',
                    showCancel: false,
                  })
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '获取权限失败，将无法保存到相册哦~',
                    showCancel: false,
                  })
                }
              },
            })
          }
        })
      }
    }
  })
}

})
