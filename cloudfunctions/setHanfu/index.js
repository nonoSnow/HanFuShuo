// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'cxserver01'
})

// 云函数入口函数
exports.main = (data)=>{
  console.log("传入云函数setHanfu的data:",data);
  // 修改数据库 hanfu
  let db=cloud.database();
  return db.collection('hanfu').doc(data.id).update({data:{heart:data.num}})
}