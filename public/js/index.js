(function(win){
  class PageClass{
    constructor(){
      this.isInit = false;
      this.page = {
        current:1,
        size:10,
        total:1,
      }
    }
    pageInit(info){
      this.page.current=_.toInteger(info.current)||1;
      this.page.size=_.toInteger(info.size)||10;
      this.page.total=_.toInteger(info.total)||1;

      this.createPageSelect();
      this.isInit = true;
    }
    get current(){
      return _.toSafeInteger(this.page.current);
    }
    get size(){
      return _.toSafeInteger(this.page.size);
    }
    pageChange(p){
      let currentPage = $("#pageSelectId option:selected").val();
      this.page.current = currentPage;

      // 刷新列表
      list.fetchData(list.searchText);
    }
    createPageSelect(){
      let sizeMo = this.page.total % this.page.size;
      let sizePg = _.floor(this.page.total / this.page.size);
      const optionSize = sizeMo ? sizePg+1:sizePg;
      let docfrag = document.createDocumentFragment();
      for(let i=0;i<optionSize;i++){
        let option = document.createElement('option');
        option.value=(i+1);
        option.textContent = i+1;
        docfrag.appendChild(option);
      }
      // 如果已经初始化了页码信息则不需要重新渲染页码
      if(!this.isInit){
        $("#pageSelectId").html(docfrag);
      }
    }
  }
  
  class ListClass {
    constructor(){
      this.totalList = [];
      this.topList = [];
    }
    makeTableCell(val,type) {
      let trEle = document.createElement('tr');
      _.forEach(val, (v, idx) => {
        let tdEle = document.createElement(type);
        tdEle.textContent = v;
        trEle.appendChild(tdEle);
      })
      return trEle;
    }
    createTableList() {
      $("#resultList").html('');
      const tableEle = document.createElement('table');
      tableEle.className ="pure-table table";
      const tableTheadEle = document.createElement('thead');
      const tableTbodyEle = document.createElement('tbody');
      
      _.forEach(this.totalList,(val,idx)=>{
        if(idx==0){
          let thead = this.makeTableCell(val, 'th');
          tableTheadEle.appendChild(thead);
        }else{
          let tbody = this.makeTableCell(val, 'th');
          tableTbodyEle.appendChild(tbody);
        }
      })
      tableEle.appendChild(tableTheadEle)
      tableEle.appendChild(tableTbodyEle)
      $("#resultList").append(tableEle);
    }
    fetchData(val){
      let url = "/search?s="+val+"&page="+page.current+"&page_size="+page.size;
      $.get(url,  (resp) =>{
        this.totalList = resp.data;
        page.pageInit(resp.page);
        
        this.createTableList();
      })
    }
    get searchText(){
      const val = document.getElementById("searchTextId").value;
      const sevalue = encodeURIComponent(escape(val));
      return sevalue;
    }
    doSearch() {
      this.fetchData(this.searchText);
    }
  }
  let page = new PageClass();
  let list = new ListClass();
  win.doSearch = list.doSearch.bind(list);
  win.pageChange = page.pageChange.bind(page);
  // win.doSearch();
})(window)