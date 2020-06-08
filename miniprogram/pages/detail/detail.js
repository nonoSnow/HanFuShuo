// pages/detail/detail.js
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

let db=wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:[],  //当前用户信息
    id:"",
    imgs:["../../images/heart.png","../../images/index.png","../../images/index_active.png"],
    hanfuList:[],
    comments:[],  //评论数组
    state:false,
    content:"" //评论内容
  },
  // 评论聚焦
  toComment(){
    this.setData({state:true})
  },
  // 改变内容
  changeContent(e){
    this.setData({content:e.detail})
  },
  // 发表评论
  sendComment(){
    if(this.data.content==""){
      Toast.fail('请先评论再发送哦~');
      return
    }
    let comments=this.data.comments;
    let obj={};
    obj.userId=this.data.userInfo._id;
    obj.userName=this.data.userInfo.userName;
    obj.userImg=this.data.userInfo.userImg;
    obj.comment=this.data.content;
    obj.pubTime=new Date().toLocaleDateString();
    comments.push(obj)
    wx.cloud.callFunction({
      name:'updateHanfu',
      data:{id:this.data.id,comments:comments},
      success:res=>{
        Toast.success('发布成功');
        this.setData({content:""}); //清空
        // 再次渲染页面
        db.collection("hanfu").doc(this.data.id).get().then(res=>{
          console.log("detail查询成功：",res);
          res.data.pubTime=new Date(res.data.pubTime).toLocaleDateString();
          console.log(res.data.pubTime)
          this.setData({hanfuList:res.data,comments:res.data.comments});
        }).catch(err=>console.log("detail查询失败：",err))
      },
      fail:err=>{
        console.log('评论添加失败',err)
      }
    })
  },
  // 增加赞
  heartAdd(){
    let that=this;
    // 修改集合中的一条记录
    // 调用云函数的修改函数 setHanfu
    wx.cloud.callFunction({
      name:'setHanfu',
      data:{id:that.data.id,num:that.data.hanfuList.heart+1},
      success:res=>{
        console.log('赞添加成功',res);
        // 再次渲染页面
        db.collection("hanfu").doc(this.data.id).get().then(res=>{
          console.log("detail查询成功：",res);
          res.data.pubTime=new Date(res.data.pubTime).toLocaleDateString();
          console.log(res.data.pubTime)
          this.setData({hanfuList:res.data,comments:res.data.comments});
        }).catch(err=>console.log("detail查询失败：",err))
      },
      fail:err=>{
        console.log('赞添加失败',err)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({id:options.id});
    db.collection("hanfu").doc(this.data.id).get().then(res=>{
      console.log("detail初始化查询成功：",res);
      res.data.pubTime=new Date(res.data.pubTime).toLocaleDateString();
      console.log(res.data.pubTime)
      this.setData({hanfuList:res.data,comments:res.data.comments});
    }).catch(err=>console.log("detail初始化查询失败：",err))
    // 当前访问用户
    let that=this;
    wx.getStorage({
      key: 'userId',
      success (res) {
        console.log('用户的id',res.data);
        //查询数据库中user集合中满足条件的记录 ： select * from comment where nikeName='亮亮'
        db.collection('user').doc(res.data).get().then(res=>{
          that.setData({
            userInfo:res.data
          })
          console.log('用户的个人信息：',that.data.userInfo);
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