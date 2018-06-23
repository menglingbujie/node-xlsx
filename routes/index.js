const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const path = require("path");
const _ = require("lodash");
const fs = require("fs");
function importExcel(filepath,callback){
  let data = [],err=null;
  try{
    let workbook = XLSX.readFile(filepath);
    let sheetNames = workbook.SheetNames;
    
    let sheet1 = workbook.Sheets[sheetNames[1]];
    // console.log(sheetNames[0],"==workboodk==",sheet1)
    
    let range = XLSX.utils.decode_range(sheet1['!ref']);

    for(let R=range.s.r;R<=range.e.r;++R){
      let row=[],flag=false;
      for(let C=range.s.c;C<=range.e.c;++C){
        let row_value=null;
        let cell_address = {c:C,r:R};
        let cell = XLSX.utils.encode_cell(cell_address);
        if(sheet1[cell]){
          row_value=sheet1[cell].v;
        }else{
          row_value="";
        }
        row.push(row_value);
      }

      for(let i=0;i<row.length;i++){
        if(row[i]!=''){
          flag=true;
          break;
        }
      }
      if(flag){data.push(row)}
    }
  }catch(e){
    err = "解析出错："+e.toString();
  }

  callback(err,data);
}
let globalData = []; // 处理xlsx后的数据
const MAX_XLSX_FILE_SIZE=5; // 最多处理xlsx文件个数

function getXlsxFilePath(){
  const xlsxPath = path.resolve(__dirname,'../public/excel');
  const pa = fs.readdirSync(xlsxPath);
  return _.slice(pa,0,MAX_XLSX_FILE_SIZE);
}

function processXLSX(){
  let xlsxFiles = getXlsxFilePath()||[];// 需要处理的xlsx文件
  _.forEach(xlsxFiles,function(v,index){
    const fullpath = path.resolve(__dirname,'../public/excel/',v);
    // console.log(v,"====",fullpath)
  })
}
processXLSX();
/* GET home page. */
router.get('/', function(req, res, next) {
  // const file = path.resolve(__dirname,"../public/excel/0708data.xlsx");
  // importExcel(file,(err,data)=>{
  //   if(err){
  //     console.log(err);
  //   }else{
  //     // console.log(data);
  //     globalData = data;
  //   }
  // })
  res.render('index', { title: 'Express' });
});

const PAGESIZE=10;
let findData = [];
router.get('/search',function(req,res,next){
  const reqQuery = req.query;
  const searchText = reqQuery.s||"";
  const page = _.toInteger(reqQuery.page)||1;
  if(!searchText){
    return res.json({ret:true,error_msg:"没有搜索内容",data:[]});
  }
  const fkey = decodeURIComponent(unescape(searchText));
  // console.log( "=st=", decodeURIComponent(unescape(searchText)))
  let pagePos = (page-1)*PAGESIZE;
  let retData = [];
  if(page==1){
    retData = _.slice(globalData,pagePos,pagePos+PAGESIZE);
  }else{
    retData = _.slice(globalData,pagePos,pagePos+PAGESIZE-1);
    retData.unshift(_.head(globalData));
  }
  let ret = {
    ret: true, 
    data: retData,
    error_msg:'',
    page:{
      current:page,
      size:PAGESIZE,
      total:globalData.length
    }
  }
  return res.json(ret);
});

module.exports = router;
