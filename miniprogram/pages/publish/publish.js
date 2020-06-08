// pages/publish/publish.js
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
let db=wx.cloud.database();  //连接到数据库服务器

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{}, //用户信息
    fileList:[], //上传图片的地址
    cloudList:[], //已经上传的地址
    title:"", //标题
    content:""  //正文
  },
  // 图片名字
  generateRandomFile(oldName){
    //随机文件名：images/upload/+当前系统时间戳+五位随机数+文件后缀名
    let file='images/upload/';
    file += new Date().getTime();
    file += Math.floor(Math.random()*90000 + 10000);
    file += oldName.substring(oldName.lastIndexOf('.'));
    return file
  },
  // 上传图片
  afterRead(e){
    console.log(e)
    let file=e.detail.file.path;
    let fileList=this.data.fileList;
    fileList.push({url:file});
    this.setData({fileList});
    console.log(this.data.fileList)
  },
  // 删除图片
  delete(e){  //监听选中的文件右上角删除按钮被点击
    console.log(e);
    let i=e.detail.index //即将删除的图片下标
    let fileList=this.data.fileList;
    fileList.splice(i,1)  //从数组中删除元素
    this.setData({fileList})
  },
  // 改变题目
  changeTitle(e){
    this.setData({title:e.detail})
  },
  // 改变内容
  changeContent(e){
    this.setData({content:e.detail})
  },
  // 发布汉服说
  publish(){
    // 验证
    if(this.data.fileList.length==0){
      Dialog.alert({
        title: '提示',
        message: '请添加图片哦',
      }).then(() => {});
      return;
    }
    if(this.data.title.trim()==''){
      Dialog.alert({
        title: '提示',
        message: '请填写标题',
      }).then(() => {});
      return;
    }
    if(this.data.content.trim()==''){
      Dialog.alert({
        title: '提示',
        message: '请填写内容',
      }).then(() => {});
      return;
    }
    // 验证成功后
    // 先上传图片
    this.data.fileList.forEach((item,i)=>{
      wx.cloud.uploadFile({
        filePath:item.url,
        cloudPath:this.generateRandomFile(item.url), //上传到云服务器上的文件路径
        success:res=>{
          console.log('文件上传成功',res);
          // 上传完成需要更新 cloudList
          let cloudList=this.data.cloudList;
          cloudList.push(res.fileID);
          this.setData({ cloudList });
          console.log(this.data.cloudList);
          if(i==this.data.fileList.length-1){
            // 向hanfu数据库 增加一条数据
            db.collection('hanfu')
            .add({
              data:{  
                userId:this.data.userInfo._id,
                userImg:this.data.userInfo.userImg,
                userName:this.data.userInfo.userName,
                content:this.data.content,
                title:this.data.title,
                pubTime:new Date().getTime(),  //上传时间戳，方便排序
                heart:0,
                comments:[],
                pics:this.data.cloudList
              }
            })
            .then(res=>{
              console.log('新纪录添加成功',res);
              // 跳转到首页
              Dialog.alert({
                title: '提示',
                message: '发布成功，可在‘我的’查看',
              }).then(() => {
                // 清空页面数据
                this.setData({
                  fileList:[], //上传图片的地址
                  cloudList:[], //已经上传的地址
                  title:"", //标题
                  content:""  //正文
                })
                wx.switchTab({
                  url: '/pages/me/me'
                })
              });
            })
            .catch(err=>{
              console.log('新纪录添加失败',res);
            })
          }
        },
        fail:err=>{
          console.log('文件上传失败',err);
        }
      })
    })
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    wx.getStorage({
      key: 'userId',
      success (res) {
        db.collection('user').doc(res.data).get().then(res=>{
          that.setData({
            userInfo:res.data
          })
          console.log('用户的个人信息：',that.data.userInfo);
          that.setData({userInfo:that.data.userInfo})
        }).catch(err=>{
          console.log('个人信息查询执行失败',err)
        })
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