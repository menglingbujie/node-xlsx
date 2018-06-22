(function(win){
  class PageClass{
    constructor(){
      this.page = {
        current:1,
        size:10,
        total:1,
      }
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
      list.updateList();
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
      $("#pageSelectId").html(docfrag);
    }
    setTotal(t){
      this.page.total = t;
      this.createPageSelect();
    }
  }
  
  class ListClass {
    constructor(){
      this.totalList = [];
      this.resultList = [];
      this.filterList = [];
      this.topList = [];
    }
    updateList(){
      let pos = (page.current - 1) * page.size;
      this.filterList = _.slice(this.resultList, pos, page.size + pos);
      this.createTableList();
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
      
      let thead = this.makeTableCell(this.topList, 'th');
      tableTheadEle.appendChild(thead);

      _.forEach(this.filterList,(val,idx)=>{
        let tbody = this.makeTableCell(val, 'th');
        tableTbodyEle.appendChild(tbody);
      })
      tableEle.appendChild(tableTheadEle)
      tableEle.appendChild(tableTbodyEle)
      $("#resultList").append(tableEle);
    }
    doSearch() {
      const val = document.getElementById("searchTextId").value;
      const sevalue = encodeURIComponent(escape(val));
      $.get("/search?s=" + sevalue,  (resp) =>{
        this.totalList = resp.data;
        this.resultList = _.slice(this.totalList,1);
        this.topList = _.head(this.totalList);
        page.setTotal(this.resultList.length);
        this.updateList();
      })
    }
  }
  let page = new PageClass();
  let list = new ListClass();
  win.doSearch = list.doSearch.bind(list);
  win.pageChange = page.pageChange.bind(page);
  win.doSearch();
})(window)