// pages/main/main.js
let db=wx.cloud.database();//连接数据库

Page({

  /**
   * 页面的初始数据
   */
  data: {
  },
  f2(e){
    console.log('用户关闭了授权对话框');
    console.log(e);
    let userInfo=e.detail.userInfo //用户授权了
    //向数据库中的集合里添加新的记录：insert into comment values(?,?)
    db.collection('user')
    .add({
      data:{  //data就是即将要添加进入数据库的新纪录——不推荐使用
        userName:userInfo.nickName,
        userImg:userInfo.avatarUrl
      }
    })
    .then(res=>{
      console.log('新纪录添加成功',res);
      wx.setStorage({
        key:"userId",
        data:res._id
      })
    })
    .catch(err=>{
      console.log('新纪录添加失败',res);
    })

    wx.getStorage({
      key: 'userId',
      success (res) {
        console.log('用户的id',res.data)
      }
    })
    // 跳转到首页
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //页面一加载，就读取当前微信用户的公开信息
    wx.getUserInfo({
      success:res=>{  //用户允许小程序获取个人信息
        console.log('获取个人信息成功',res);
        db.collection('user').where({userImg:res.userInfo.avatarUrl}).get().then(res=>{
          console.log('查询数据执行成功',res.data[0]._id);
          wx.setStorage({
            key:"userId",
            data:res.data[0]._id
          })
          // 跳转到首页
          wx.switchTab({
            url: '/pages/index/index'
          })
        }).catch(err=>{
          console.log('查询执行失败',err)
        })
      },
      fail:err=>{  //用户拒绝了小程序获取个人信息
        console.log('获取个人信息失败',err)
      }
    })
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

  }
})