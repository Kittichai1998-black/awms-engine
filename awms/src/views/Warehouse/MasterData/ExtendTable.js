import React, { Component } from 'react';
import {Input, Button} from 'reactstrap';
import {Link}from 'react-router-dom';
import ReactTable from 'react-table'
import Axois from 'axios';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {EventStatus}  from '../Status'
import {Clone} from '../ComponentCore'

const getColumnWidth = (rows, accessor, headerText) => {
  const maxWidth = 400
  const magicSpacing = 10
  let cellLength = 10
  if(rows > 0 && rows !== undefined){
    cellLength = Math.max(
      ...rows.map(row => (`${row[accessor]}` || '').length),
      headerText.length,)
  }
  return Math.min(maxWidth, cellLength * magicSpacing)
}

const createQueryString = (select,wherequery) => {
    let where = select.q[0]
    let myJSON
    if (where !== undefined){
      where.v = wherequery === undefined || null ? where.v : wherequery
      myJSON = JSON.stringify([where])
    }
    let queryS = select.queryString + (select.t === "" ? "?" : "?t=" + select.t)
    + (select.fields === "" ? "" : "" + select.fields)
   /*  + (select.q === "" ? "" : "&q=" + myJSON)
    + (select.f === "" ? "" : "&f=" + select.f)
    + (select.g === "" ? "" : "&g=" + select.g)
    + (select.s === "" ? "" : "&s=" + select.s)
    + (select.sk === "" ? "" : "&sk=" + select.sk)
    + (select.l === 0 ? "" : "&l=" + select.l)
    + (select.all === "" ? "" : "&all=" + select.all) */
    +(select.s_f === "" ? "" : "&s_f=" + select.s_f)
    +(select.s_od === "" ? "" : "&s_od" + select.s_od)
    + (select.sk === "" ? "" : "&sk=" + select.sk)
    + (select.l === 0 ? "" : "&l=" + select.l)
    + ("&token=" + sessionStorage.Token)
    return queryS
}

const createQueryStringStorage = (url,field,order) => {
  let sortfield = new RegExp("([?&]).*?(&|$)", "i");
  let sortorder = new RegExp("([?&]).*?(&|$)", "i");
  const urledit = url.replace(sortfield, "$1s_f=" + field + '$2').replace(sortorder, "$1s_od=" + order + '$2')
  return urledit;
}

const createQueryStringPage = (url, size) => {
  let sortskip = new RegExp("([?&]).*?(&|$)", "i");
  const urledit = url.replace(sortskip, '$1' + "sk" + "=" + size + '$2')
  return urledit;
}

const makeDefaultState = () => ({
    sorted: [],
    page: 0,
    pageSize: 10,
    expanded: {},
    resized: [],
    filtered: []
  });

class ExtendTable extends Component{
    constructor(){
        super()
        this.state={
            dataselect:[],
            data:[],
            colums:[],
            loading:true,
            datafilter:[],
            filter:true,
            dropdownfilter:[],
            currentPage: 1,
            ...makeDefaultState()
            
        }
        this.onCheckFliter = this.onCheckFliter.bind(this)
        this.datetimeBody = this.datetimeBody.bind(this)
        this.customSorting = this.customSorting.bind(this)
        this.checkboxBody = this.checkboxBody.bind(this)
        this.paginationButton = this.paginationButton.bind(this)
        this.subTable = this.subTable.bind(this)
        this.onCheckFilterExpand = this.onCheckFilterExpand.bind(this)
        this.addtolist = this.addtolist.bind(this)
        this.sumChild = this.sumChild.bind(this)
        this.onHandleSelection = this.onHandleSelection.bind(this)
        this.createSelectAll = this.createSelectAll.bind(this)
        this.createSelection = this.createSelection.bind(this)
    }

    componentDidMount(){
      if(this.props.url === null || this.props.url === undefined){
        const dataselect = this.props.data
        this.setState({dataselect:dataselect})
        let queryString = createQueryString(this.props.data)
        Axois.get(queryString).then(
        (res) => {
            this.setState({data:res.data.datas})
            this.setState({loading:false})
        })        
      }
      else{
        Axois.get(this.props.url).then(
          (res) => {
              this.setState({data:res.data.datas})
              this.setState({loading:false})
          })
      }
    }

    onCheckFilterExpand(filter){
      let filterlist = []
      let urledit = this.props.url
      if(filter.length > 0)
        {
          filter.forEach((data, id) => {
            if(data[1] !== ""){
              filterlist.push({field:data["id"], value:data["value"]})
            }
          })
          filterlist.forEach((row) => {
            let filteredit = new RegExp("([?&])" + row.field + ".*?(&|$)", "i");
            let urleditx = urledit.replace(filteredit, '$1' + row.field + "=" + row.value + '$2')
            urledit = urleditx
            console.log(urleditx)
          })
          Axois.get(urledit).then(
            (res) => {
              this.setState({data:res.data.datas, loading:false});
            }
          )
        }
        else{
          Axois.get(this.props.url).then(
              (res) => {
                this.setState({data:res.data.datas, loading:false});
              }
          )
        }
    }

    onCheckFliter(filter,dataselect){
        let filterlist = []
        var test;
        
        if(filter.length > 0)
        {
          filter.map((data, id) => {
            if(data[1] !== ""){
              switch(data["value"].toString().charAt(0)){
                case "=":
                  filterlist.push([{"f":data["id"], "c":"=", "v": data["value"].replace("=","")}])
                  break
                case ">":
                  filterlist.push([{"f":data["id"], "c":">", "v": data["value"].replace(">","")}])
                  break
                case "<":
                  filterlist.push([{"f":data["id"], "c":"<", "v": data["value"].replace("<","")}])
                  break
                case ">=":
                  filterlist.push([{"f":data["id"], "c":">=", "v": data["value"].replace(">=","")}])
                  break
                case "<=":
                  filterlist.push([{"f":data["id"], "c":"<=", "v": data["value"].replace("<=","")}])
                  break
                case "%":
                  filterlist.push([{"f":data["id"], "c":"like", "v": data["value"]}])
                  break
                case "*":
                  filterlist.push([{"f":data["id"], "c":"!=", "v":2}])
                  break
                default:
                  /* filterlist.push([{"f":data["id"], "c":"=", "v": data["value"]}]) */
                  filterlist.push(data["id"] + "="+ data["value"])
              }
              const select = dataselect
              console.log(filterlist)
              select["fields"] = JSON.stringify(...filterlist)
              let queryString = createQueryString(select)
              Axois.get(queryString).then(
                  (res) => {
                    console.log(queryString)
                    this.setState({data:res.data.datas, loading:false});
                    console.log(this.state.data)
                  }
              )
            }
          })
        }
        else{
          const select = dataselect
          select["q"] = ""
          let queryString = createQueryString(select)
          Axois.get(queryString).then(
              (res) => {
                this.setState({data:res.data.datas, loading:false});
              }
          )
        }
    }

    createCustomFilter(name){
      let filter = [...this.state.datafilter]
      return <Input type="text" id={name}
        onKeyPress={(e) => {
          if (e.key === 'Enter'){
              filter.forEach((datarow,index) => {
                  if(datarow.id === name){
                      filter.splice(index,1);
                  }
              })
              if(e.target.value !== ""){
                  filter.push({id: name, value:e.target.value})
              }
              this.onCheckFliter(filter,this.state.dataselect)
              this.setState({datafilter:filter, loading:true})
          }}
        } />
    }

    createDropdownFilter(name,func,data){
      let filter = [...this.state.datafilter]
      let item = null
      let list = null
      this.props.dropdownfilter.forEach(row => {
        if(row.field === name){
          item = row.status.map((data, index) => {
            return <option key={index} value={data.value}>{data.label}</option>
          })
          list = <select onChange={(e) => {
            filter.forEach((datarow,index) => {
              if(datarow.id === name){
                  filter.splice(index,1);
              }
            })
            if(e.target.value !== ""){
                filter.push({id: name, value:e.target.value})
            }
            func(filter,data)
            this.setState({datafilter:filter, loading:true})
          }}>{item}</select>
        }
      })
      return list
    }


    datetimeBody(value){
        if(value !== null){
          const date = moment(value);
          return <div>{date.format('DD-MM-YYYY HH:mm:ss')}</div>
        }
    }

    checkboxBody(value){
        return <input type="checkbox"
            checked={value === 1 || value === true}
            readOnly/>
    }

    customSorting(data){
        const select = this.props.data
        select["s"] = JSON.stringify([{'f':data[0].id,'od':data[0].desc === false ? 'asc' : 'desc'}])
        let queryString = ""
        if(this.props.url === undefined || null){
          queryString = createQueryString(select)
        }
        else{
          queryString = createQueryStringStorage(this.props.url,data[0].id,data[0].desc === false ? 'asc' : 'desc')
        }
        Axois.get(queryString).then(
        (res) => {
            this.setState({data:res.data.datas, loading:false})
        })
    }

    pageOnHandleClick(position){
      if(this.props.url === undefined || this.props.url === null)
      {
        let queryString = "";
        this.setState({loading:true})
        const select = this.state.dataselect
        console.log(select)
        if(position === 'next'){
          select.sk = parseInt(select.sk === "" ? 0 : select.sk, 10) + parseInt(select.l, 10)
          queryString = createQueryString(select)
        }
        else{
          if(select.sk - select.l >= 0){
            select.sk = select.sk - select.l
          }
          queryString = createQueryString(select)
        }
        Axois.get(queryString).then(
          (res) => {
            if(res.data.datas.length > 0){
              if(position === 'next'){
                ++this.state.currentPage
              }
              else{
                if(this.state.currentPage !== 1)
                  --this.state.currentPage
              }
              this.setState({data:res.data.datas})
            }
            else{
              select.sk = parseInt(select.sk === "" ? 0 : select.sk, 10) - parseInt(select.l, 10)
            }
            this.setState({loading:false})
          }
        )
      }
      else{
        let queryString = "";
        this.setState({loading:true})
        let select = this.state.pageSize
        if(position === 'next'){
          select = parseInt(select === "" ? 0 : select, 10) + parseInt(select, 10)
          queryString = createQueryStringPage(this.props.url, select)
          this.setState({pageSize:select})
        }
        else{
          if(select - 10 >= 0){
            select = select - 10
            this.setState({pageSize:select})
          }
          queryString = createQueryStringPage(this.props.url, select)
        }
        Axois.get(queryString).then(
          (res) => {
            if(res.data.datas.length > 0){
              this.setState({data:res.data.datas})
            }
            this.setState({loading:false})
          }
        )
      }
    }

    paginationButton(){
      return(
        <div style={{marginBottom:'3px',textAlign:'center',margin:'auto',width:'300px'}}>
          <nav>
            <p className="float-right" style={{width:"100px"}}>Page : {this.state.currentPage}</p>
            <ul className="pagination">
              <li className="page-item"><a className="page-link" onClick={() => this.pageOnHandleClick("prev")}>Previous</a></li>
              <li className="page-item"><a className="page-link" onClick={() => this.pageOnHandleClick("next")}>Next</a></li>
            </ul>
          </nav>
        </div>
      )
    }
    
    createCustomButton(url){
      return <Button type="button" color="info" onClick={() => this.props.history.push(url)}>History
        </Button>
    }

     createSelectButton(event){
      return <input type="checkbox"/>
    }

    onHandleSelection(rowdata, value, type){
      if(type === "checkbox"){
        let rowselect = this.state.rowselect;
        if(value){
          rowselect.push(rowdata.original)
        }
        else{
          rowselect.forEach((row,index) => {
            if(row.ID === rowdata.original.ID){
              rowselect.splice(index,1)
            }
          })
        }
        this.setState({rowselect}, () => {this.props.getselection(this.state.rowselect)})
      }
      else{
        let rowselect = [];
        if(value){
          rowselect.push(rowdata.original)
        }
        this.setState({rowselect:rowselect}, () => {this.props.getselection(this.state.rowselect)})
      }
    }

    createSelectAll(){
      return <input
      type="checkbox"
      onChange={(e)=> {
        this.props.getselection(this.state.data);
        var arr = Array.from(document.getElementsByClassName('selection'));
        if(e.target.checked){
          arr.forEach(row => {
            row.checked = true
          })
        }
        else{
          arr.forEach(row => {
            row.checked = false
          })
        }
      }}/>
    }
    createSelection(rowdata,type){
      return <input
      className="selection"
      type={type}
      name="selection"
      onChange={(e)=> this.onHandleSelection(rowdata, e.target.checked, type)}/>//
    }

    sumChild(data){
      
      let getdata = []
      data.forEach(row1 => {
        let xx = getdata.filter(row => row.code == row1.code)
        if(xx.length > 0){
          let qty = xx[0].allqty
          xx[0].allqty = xx[0].allqty + 1
          if(row1.storageObjectChilds.length > 0)
            this.sumChild(row1.storageObjectChilds)
        }
        else{
          row1.allqty = 1
          getdata.push(row1)
          row1.storageObjectChilds = this.sumChild(row1.storageObjectChilds)
        }
      })
      console.log(getdata)
      return getdata
    }

    addtolist = (data) => 
    {
      //const condata = [...data]
      const focus = {color:'red', marginLeft:"-20px", fontSize:"13px"}
      const focusf = {color:'green', marginLeft:"-20px", fontSize:"13px"}
      return data.map((child,i) => {
        let disQtys;
        if(child.storageObjectChilds.length > 0){
          disQtys = child.storageObjectChilds.map((v)=>{
            return <div>{v.weigthKG + ' ' + v.weigthKG + (v.weigthKG?' : Min ' + v.weigthKG:'') + (v.weigthKG?" : Max "+v.weigthKG:'')}</div>
          });
        }
        else{
          disQtys = <div>{child.weigthKG}</div>
        }
        
         return <ul key={i} style={child.isFocus===true?focus:focusf}>
          <span>{child.baseMaster_Code===null? child.packMaster_Code : child.baseMaster_Code} : {child.baseMaster_Name===null? child.packMaster_Name : child.baseMaster_Name} </span>
          <span>{child.allqty===null?'':'[qty: ' + child.allqty + ']'} </span>
          <span>{child.weigthKG===null?'':'[wei:' + child.weigthKG + 'Kg.]'} </span> 
          {/* <br/><span style={{color:'gray'}}> {disQtys}</span> */}
  
          { (child.storageObjectChilds.map(child2 => {
            let z = this.addtolist([child2])
            return z})) 
          }
           </ul> 
      })
    }

    subTable(e){
      const test = this.sumChild(Clone([e.original]))
      return this.addtolist(test)
      /* if(this.props.subtype === 1){
        let data = []
        e.original.storageObjectChilds.forEach(row => {
          data.push({"id":row.code,
              "code":row.viewChildPackMaster_Codes,
              "type":row.baseMaster_Name,
              "sumpack":row.viewPackMaster_Qty,
              "sumsku":row.viewSKUMaster_Qty,
              "parent":row.parentStorageObject_ID,
              "_type":1})
              
             row.storageObjectChilds.forEach(childrow => {
              data.push({"id":childrow.code,
                "code":childrow.viewChildPackMaster_Codes,
                "type":childrow.baseMaster_Name,
                "sumpack":childrow.viewPackMaster_Qty,
                "sumsku":childrow.viewSKUMaster_Qty,
                "parent":childrow.parentStorageObject_ID,
                "_type":2})
             })
        })
        
        let seen =[]
        let subdata =[]
        data.forEach((row,index) => {
          let id = row["code"].toString() + row["parent"].toString()
  
          if(id in seen){
            let qty = seen[id].sumsku + row.sumsku
            seen[id].sumsku = qty
          }
          else {
            seen[id] = row;
          }
        })
  
        for(let list in seen){
          subdata.push(seen[list])
        }
  
        if(data.length > 0){
          const col = this.props.subcolumn
          col.forEach((row) =>{
            if(row.Cell === "button"){
              row.Cell = (e) => this.createCustomButton('/mst/storage/manage/history?id='+e.original.code)
            }
          })
          return <ReactTable style={{ padding: "20px", width:this.props.subtablewidth }}
          data={subdata}
          filterable={false}
          sortable={false}
          columns={this.props.subcolumn}
          showPagination={false}
          minRows={1}
          defaultPageSize={1000}
          getTrProps={(event, rowData) => {return {
            style: {
              background: rowData.original._type === 1 ? "gray" : null
            }
          }}}
        />
        }
      }
      else{

      } */
    }
    
    setStatusText(rowdata){
      if (rowdata.column.id==="status"){
        if(rowdata.row["status"] === 0){
          return "Inactive"
        }else if(rowdata.row["status"] === 1){
          return "Active" 
        }
      }else if (rowdata.column.id==="holeStatus"){
        if(rowdata.row["holeStatus"] === 0){
          return "No"
        }else if(rowdata.row["holeStatus"] === 1){
          return "Yes" 
        }
      }
    }

    render(){
        const col = this.props.column
        col.forEach((row) => {
            //set กล่อง Filter
            row.width = getColumnWidth(this.state.data, row.accessor, row.Header)

            if(row.Filter === "text"){
              row.Filter = () => this.createCustomFilter(row.accessor,this.onCheckFilterExpand,this.state.dataselect)
            }
            else if(row.Filter === "dropdown"){
              row.Filter = () => this.createDropdownFilter(row.accessor,this.onCheckFilterExpand,this.state.dataselect)
            }
            if(row.Status === "text"){
              row.Cell = (e) => (this.setStatusText(e))
            }

            if(row.Cell === "datetime"){
                row.Cell = (e) => this.datetimeBody(e.value)
            }
            else if(row.Cell === "checkbox"){
                row.Cell = (e) => this.checkboxBody(e.value)
            }
            else if(row.Cell === "button"){
              row.Cell = (e) => this.createCustomButton('/mst/storage/manage/history?id='+e.original.code)
            }

            if(row.Aggregated === "blank"){
              row.Aggregated = (e) => {return (<span></span>);}
            }
            else if(row.Aggregated === "button"){
              row.Aggregated = (e) => this.createCustomButton(
                '/mst/storage/manage/history?id='+e.original.code
              )
            }
            else if(row.Aggregated === "select"){
              row.Aggregated = (e) => this.createSelectButton(e.row._subRows[0]._original)
            }
        })

        return(
            <ReactTable data={this.state.data}
            style={{backgroundColor:'white'}}
            loading={this.state.loading}
            filterable={this.props.filterable}
            columns={col}
            pivotBy={this.props.pivotBy}
            multiSort={false}
            showPagination={true}
            minRows={5}
            SubComponent={this.subTable}
            PaginationComponent={this.paginationButton}
            /* onSortedChange={(sorted) => {
                this.setState({data:[], loading:true });
                this.customSorting(sorted)}
            } *//>
        )
    }
}

const getLogData = (data) =>{
  
}



export default ExtendTable