// pages/me/me.js
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
let db=wx.cloud.database();  //连接到数据库服务器

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},  //用户信息
    userHanfu:[],  //用户发布的汉服说
    pno:0,  //当前页
    pageCount:0,  //总条数
    heartAll:0// 总赞数
  },
  // 获得总赞数
  getHearts(){
    wx.cloud.callFunction({
      name:'getHanfu',
      data:{count:"",userId:this.data.userInfo._id},
      success:res=>{
        console.log('赞查询成功',res);
        let heartAll=0;
        res.result.data.forEach((item,index)=>{
          heartAll += item.heart
        })
        this.setData({
          heartAll
        })
      },
      fail:err=>{
        console.log('赞添加后查询当前失败',err)
      }
    })
  },
  // 加载数据
  loadData(pno){
    db.collection('hanfu')
    .where({userId:this.data.userInfo._id})
    .orderBy('pubTime','desc')
    .skip(pno)
    .limit(8)
    .get().then(res=>{
      let userHanfu=this.data.userHanfu;
      userHanfu=userHanfu.concat(res.data);
      this.setData({
        userHanfu
      });
      this.getHearts();
    })
  },
  // 增加赞
  heartAdd(e){
    let num=e.target.dataset.heartCount+1;
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
          data:{count:this.data.userHanfu.length,userId:this.data.userInfo._id},
          success:res=>{
            console.log('赞添加后查询当前成功',res);
            this.setData({
              userHanfu:res.result.data,
            })
            this.getHearts();
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
  // 跳转到详情页
  toDetail(e){
    let id=e.currentTarget.dataset.detailId;
    console.log("详情页的id",id);
    wx.navigateTo({
      url: '/pages/detail/detail?id='+id,
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
        //查询数据库中user集合中满足条件的记录 ： select * from comment where nikeName='亮亮'
        db.collection('user').doc(res.data).get().then(res=>{
          that.setData({
            userInfo:res.data
          })
          console.log('用户的个人信息：',that.data.userInfo);
          db.collection('hanfu').where({userId:res.data._id}).orderBy('pubTime','desc').get().then(hfres=>{
            that.setData({
              userHanfu:hfres.data
            })
            that.getHearts();
            console.log('用户的发布汉服信息：',that.data.userHanfu);

          }).catch(err=>{
            console.log('汉服信息查询执行失败',err)
          })
          // 获得总页数
          db.collection('hanfu').where({userId:res.data._id}).count().then(res=>{
            that.setData({
              pageCount:res.total
            })
          })
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
    if(this.data.userHanfu.length){
      let that=this;
      //查询数据库中某个集合中的所有记录
      // .where({userId:this.data.userInfo._id})
      console.log(that.data.userHanfu.length,that.data.userInfo._id)
      wx.cloud.callFunction({
        name:'getHanfu',
        data:{count:that.data.userHanfu.length,userId:that.data.userInfo._id},
        success:res=>{
          that.setData({
            userHanfu:res.result.data,
          })
          that.getHearts();
        },
        fail:err=>{
          console.log('我的查询当前失败',err)
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
      userHanfu:[]
    })
    this.loadData(this.data.pno);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.userHanfu.length<this.data.pageCount){
      this.setData({
        pno:this.data.pno+8
      })
      this.loadData(this.data.pno);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  }
})