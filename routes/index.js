const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const path = require("path");
const _ = require("lodash");
const fs = require("fs");
let globalData = {}; // 处理xlsx后的数据
const MAX_XLSX_FILE_SIZE=5; // 最多处理xlsx文件个数
const PAGESIZE=10; // 数据量

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

function getXlsxFilePath(){
  const xlsxPath = path.resolve(__dirname,'../public/excel');
  const pa = fs.readdirSync(xlsxPath);
  return _.slice(pa,0,MAX_XLSX_FILE_SIZE);
}

function processXLSX(){
  let xlsxFiles = getXlsxFilePath()||[];// 需要处理的xlsx文件
  _.forEach(xlsxFiles,(v,index)=>{
    const fullpath = path.resolve(__dirname,'../public/excel/',v);
    importExcel(fullpath,(err,data)=>{
      if(err){
        console.log(err);
      }else{
        // console.log("====",data);
        // globalData.push(data);
        globalData = _.assign(globalData,data);
      }
    });
  });
}
function doSearch(key){
  let findData = {}; //找到的数据
  if(_.isEmpty(globalData)){alert("暂无数据");return;}
  // 遍历文件
  _.map(globalData,(fv,fk)=>{
    let sheets = globalData[fk];
    findData[fk]={};
    // 遍历sheet
    _.map(sheets,(sv,sk)=>{
      const sdata = sheets[sk];
      findData[fk][sk]=[];
      let firstData = [];
      
      // 遍历sheet数据
      _.forEach(sdata,(d,idx)=>{        
        if(idx===0){
          firstData = d; // 取sheet的第一行数据，一般为标题啥的
        }
        const sd = sdata[idx];
        // 开始查找
        const ret = _.indexOf(sd,key);
        //找到之后做记录
        if(ret!=-1){
          findData[fk][sk].push(sd);
          // console.log("--文件-",fk,"=表===",sk,"-数据为---",sd)
        }
      })
      if(findData[fk][sk]&&findData[fk][sk].length>0){
        findData[fk][sk].unshift(firstData);
      }
    })
  })
  return findData;
}
function filterPageData(data,page){
  // console.log("--bf-",JSON.stringify(data))

  // _.map(data,(fv,fk)=>{
  //   _.map(data[fk],(sv,sk)=>{
  //   let pagePos = (page-1)*PAGESIZE;
  //     if(page==1){
  //       data = _.slice(sv,pagePos,pagePos+PAGESIZE);
  //     }else{
  //       data = _.slice(sv,pagePos,pagePos+PAGESIZE-1);
  //       data.unshift(_.head(sv));
  //     }
  //   })
  // })
  // console.log("--af-",JSON.stringify(data))
  return data;
}
processXLSX();

// doSearch('天津');
/* GET home page. */
router.get('/', function(req, res, next) {
  // let files=[],sheets=[];
  // _.map(globalData,(fv,fk)=>{
  //   _.map(globalData[fk],(sv,sk)=>{
  //     sheets
  //   })
  // })
  // console.log("====",_.keys(globalData))
  res.render('index', { files: _.keys(globalData), maxfile:MAX_XLSX_FILE_SIZE });
});

router.get('/search',function(req,res,next){
  const reqQuery = req.query;
  const searchText = reqQuery.s||"";
  const page = _.toInteger(reqQuery.page)||1;
  if(!searchText){
    return res.json({ret:true,error_msg:"没有搜索内容",data:[]});
  }
  const fkey = decodeURIComponent(unescape(searchText));
  // console.log( "=st=", decodeURIComponent(unescape(searchText)))
  
  let retData = doSearch(fkey);// 开始查找
  let filterData = filterPageData(retData,page);
  // console.log('===reult==',JSON.stringify(filterData));
  let ret = {
    ret: true, 
    data: filterData,
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
