// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'cxserver01'
})

// 云函数入口函数
exports.main = (data)=>{
  console.log("getHanfu调用结果：",data);
  let db=cloud.database();
  if(data.count==""&&data.userId!=""){
    return db.collection('hanfu').where({userId:data.userId}).orderBy('pubTime','desc').get() 
  }else if(data.userId!=""&&data.count!=""){
      // .where({userId:this.data.userInfo._id})
      return db.collection('hanfu').where({userId:data.userId}).orderBy('pubTime','desc').skip(0).limit(data.count).get() 
  }else{
    return db.collection('hanfu').orderBy('pubTime','desc').skip(0).limit(data.count).get()
  }
  
}