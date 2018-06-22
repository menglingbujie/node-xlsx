var express = require('express');
var router = express.Router();
const XLSX = require('xlsx');
const path = require("path");
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
let globalData = [];
/* GET home page. */
router.get('/', function(req, res, next) {
  const file = path.resolve(__dirname,"../public/excel/0708data.xlsx");
  const file2 = path.resolve(__dirname,'../public/excel/baojun20180614.xlsx')
  importExcel(file,(err,data)=>{
    if(err){
      console.log(err);
    }else{
      // console.log(data);
      globalData = data;
    }
  })
  res.render('index', { title: 'Express' });
});

router.get('/search',function(req,res,next){
  const searchText = req.query.s||"";
  if(!searchText){
    return res.json({ret:true,error_msg:"没有搜索内容",data:[]});
  }
  console.log( "-==", decodeURIComponent(unescape(searchText)))
  // console.log("====st==" + unescape(decodeURIComponent(searchText)));
  return res.json({ ret: true, data: globalData,error_msg:''});
});

module.exports = router;
