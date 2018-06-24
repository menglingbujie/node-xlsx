const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const path = require("path");
const _ = require("lodash");
const fs = require("fs");
function importExcel(filepath,callback){
  let sheetObject={},err=null,bname=path.basename(filepath);
  sheetObject[bname]={};
  try{
    let workbook = XLSX.readFile(filepath);
    let sheetNames = workbook.SheetNames;
    
    // console.log(sheetNames,"==workboodk==")
    // 遍历sheet并读取相应sheet数据
    _.forEach(sheetNames,function(v,index){
      if(!sheetObject[bname][v]){sheetObject[bname][v]=[]};
      let sheet = workbook.Sheets[v];
      let range = XLSX.utils.decode_range(sheet['!ref']);

      for(let R=range.s.r;R<=range.e.r;++R){
        let row=[],flag=false;
        for(let C=range.s.c;C<=range.e.c;++C){
          let row_value=null;
          let cell_address = {c:C,r:R};
          let cell = XLSX.utils.encode_cell(cell_address);
          if(sheet[cell]){
            row_value=sheet[cell].v;
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
        if(flag){sheetObject[bname][v].push(row)}
      }
    })
  }catch(e){
    err = "解析出错："+e.toString();
  }

  callback(err,sheetObject);
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
  const fullpath = path.resolve(__dirname,'../public/excel/',xlsxFiles[0]);
  importExcel(fullpath,(err,data)=>{
    if(err){
      console.log(err);
    }else{
      // console.log("====",data);
      globalData = data;
    }
  });
}
function doSearch(key){
  if(_.isEmpty(globalData)){alert("暂无数据");return;}
  // 遍历文件
  _.map(globalData,(fv,fk)=>{
    let sheets = globalData[fk];
    // 遍历sheet
    _.map(sheets,(sv,sk)=>{
      const sdata = sheets[sk];
      // 遍历sheet数据
      _.forEach(sdata,(d,idx)=>{
        const sd = sdata[idx];
        // 开始查找
        const ret = _.indexOf(sd,key);
        //找到之后做记录
        if(ret!=-1){
          console.log("--文件-",fk,"=表===",sk,"-数据为---",sd)
        }
      })
    })
  })
}
processXLSX();

// doSearch('天津');
/* GET home page. */
router.get('/', function(req, res, next) {
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
  let retData = doSearch(fkey);// 开始查找
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
