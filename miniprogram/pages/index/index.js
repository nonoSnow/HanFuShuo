// pages/index/index.js
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
let db=wx.cloud.database(); //连接到数据库服务器 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hfList:[],  //整个汉服数据
    userId:'',
    pno:0,  //起始页
    pageCount:0,  //总页数
  },
  // 跳转到详情页
  toDetail(e){
    let id=e.currentTarget.dataset.detailId;
    console.log("详情页的id",id);
    wx.navigateTo({
      url: '/pages/detail/detail?id='+id,
    })
  },
  // 增加赞
  heartAdd(e){
    let num=e.target.dataset.heartCount+1;
    let that=this;
    // 修改集合中的一条记录
    // 调用云函数的修改函数 setHanfu
    wx.cloud.callFunction({
      name:'setHanfu',
      data:{id:e.target.dataset.heartId,num},
      success:res=>{
        console.log('赞添加成功',res);
        //查询数据库中某个集合中的所有记录
        wx.cloud.callFunction({
          name:'getHanfu',
          data:{count:this.data.hfList.length,userId:""},
          success:res=>{
            console.log('赞添加后查询当前成功',res);
            that.setData({
              hfList:res.result.data
            })
          },
          fail:err=>{
            console.log('赞添加后查询当前失败',err)
          }
        })
      },
      fail:err=>{
        console.log('赞添加失败',err)
      }
    })
  },
  // 获得总条数
  getCount(){
    db.collection('hanfu').count().then(res=>{
      this.setData({
        pageCount:res.total
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
        console.log('用户的id',res.data);
        that.setData({
          userId:res.data
        })
        that.getData(0);
        that.getCount();
      }
    })
  },
  getData(pno){
    //查询数据库中某个集合中的所有记录
    db.collection('hanfu')
    .orderBy('pubTime','desc')
    .skip(pno)
    .limit(8)
    .get().then(res=>{
      let hfList=this.data.hfList;
      hfList=hfList.concat(res.data);
      this.setData({
        hfList
      })
      console.log('查询执行成功',this.data.hfList);
    }).catch(err=>{
      console.log('查询执行失败',err)
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
    if(this.data.hfList.length){
      let that=this;
      //查询数据库中某个集合中的所有记录
      wx.cloud.callFunction({
        name:'getHanfu',
        data:{count:this.data.hfList.length,userId:""},
        success:res=>{
          that.setData({
            hfList:res.result.data
          })
          that.getCount();
        },
        fail:err=>{
          console.log(err)
        }
      })
    }
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
    console.log('下拉刷新')
    this.setData({
      pno:0,
      hfList:[]
    })
    this.getData(this.data.pno);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.hfList.length<this.data.pageCount){
      console.log("下拉次数",this.data.pno)
      this.setData({
        pno:this.data.pno+8
      })
      this.getData(this.data.pno);
    }else{
      console.log("到底了")
      // Dialog.alert({
      //   title: '提示',
      //   message: '已经到底了哦',
      // }).then(() => {});
    }
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})