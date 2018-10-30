import React, { Component } from 'react';
import {Card, CardBody, Input, Button} from 'reactstrap';
import {Link}from 'react-router-dom';
import ReactTable from 'react-table'
import Axois from 'axios';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {Clone,CreateQueryString} from '../ComponentCore'
import _ from 'lodash'
import "react-table/react-table.css";


import queryString from 'query-string'
import Downshift from 'downshift'

import withFixedColumns from "react-table-hoc-fixed-columns";

const ReactTableFixedColumns = withFixedColumns(ReactTable);



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
    + (select.fields === "" || select.fields === undefined? "" : "" + select.fields)
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
            dropdownvalue:[],
            dropdownfilter:[],
            currentPage: 1,
            statuslist:[{
              'status' : [{'value':'','label':'All'},{'value':'0','label':'Inactive'},{'value':'1','label':'Active'}],
              'header' : 'Status',
              'field' : 'status',
              'mode' : 'check',
            }],
            holdlist:[{
              'status' : [{'value':'','label':'All'},{'value':'0','label':'No'},{'value':'1','label':'Yes'}],
              'header' : 'Status',
              'field' : 'holeStatus',
              'mode' : 'check',
            }],
            eventlist:[{
              'status' : [{'value':'','label':'All'},{'value':'0','label':'WAIT'},{'value':'22','label':'INV'}],
              'header' : 'Status',
              'field' : 'eventStatus',
              'mode' : 'check',
            }],
            ...makeDefaultState()
            
        }
        this.onCheckFliter = this.onCheckFliter.bind(this)
        this.datetimeBody = this.datetimeBody.bind(this)
        this.customSorting = this.customSorting.bind(this)
        this.checkboxBody = this.checkboxBody.bind(this)
        this.paginationButton = this.paginationButton.bind(this)
        this.subTable = this.subTable.bind(this)
        this.subTree = this.subTree.bind(this)
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

    componentWillUpdate(nextProps, nextState){
      if(!_.isEqual(this.state.data, nextState.data)){
        this.setState({rowselect:[]}, () => {
          var arr = Array.from(document.getElementsByClassName('selection'));
          arr.forEach(row => {
            row.checked = false
          })
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
      
      if(filter.length > 0)
      {
        filter.forEach((data, id) => {
          let filterField  = this.props.filterFields.find(o => o.datafield === data["id"])
          if(data[1] !== ""){
            const firstletter =  data["value"].toString().charAt(0)
            const lastletter =  data["value"].toString().slice(-1)
  
            if(firstletter === "*" || lastletter === "*"){
              filterlist.forEach((row, index) => {
                if(row.f === data["id"]){
                  filterlist.splice(index,1)
                }
              })
              
              if(data["id"] === "Status"){
                filterlist.push({"f":data["id"], "c":"<", "v": 2})
              }
              else{
                /* filterlist.push({"f":data["id"], "c":"like", "v": encodeURIComponent(data["value"])}) */
                filterlist.push((filterField===undefined?data["id"]:filterField.searchfield) + "=" +encodeURIComponent(data["value"]))
              }
            }
            else if(firstletter === "%"){
              filterlist.forEach((row, index) => {
                if(row.f === data["id"]){
                  filterlist.splice(index,1)
                }
              })
              /* filterlist.push({"f":data["id"], "c":"like", "v": encodeURIComponent(data["value"])}) */
              filterlist.push((filterField===undefined?data["id"]:filterField.searchfield) + "=" +encodeURIComponent(data["value"]))
            }
            else if(data["id"] === "eventStatus"){
              filterlist.push((filterField===undefined?data["id"]:filterField.searchfield) + (data["value"]==="0"?"=0":">0"))
            }
            else{
              filterlist.forEach((row, index) => {
                if(row.f === data["id"]){
                  filterlist.splice(index,1)
                }
              })
              /* filterlist.push({"f":data["id"], "c":"=", "v": encodeURIComponent(data["value"])}) */
              filterlist.push((filterField===undefined?data["id"]:filterField.searchfield) + "=" +encodeURIComponent(data["value"]))
            }
          }
        })
        
        let select = dataselect
        select["fields"] = filterlist.join("&")
        select["sk"] = "0"
        let queryString = createQueryString(select)
        Axois.get(queryString).then(
          (res) => {
            this.setState({data:res.data.datas, loading:false});
          }
        )
      }
      else{
        const select = dataselect
        select["fields"] = this.state.originalselect
        select["sk"] = "0"
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
      return <Input type="text" id={name} style={{ background: "#FAFAFA" }} placeholder="filter..."
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

    createDropdownFilter(name,func,selectdata){
      let filter = [...this.state.datafilter]
      let item = null
      let list = null
      let dropdownfilter

      if(name === "status"){
        dropdownfilter=this.state.statuslist
      }else if(name === "holeStatus"){
        dropdownfilter=this.state.holdlist
      }else if(name === "eventStatus"){
        dropdownfilter=this.state.eventlist
      }

      dropdownfilter.forEach(row => {
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
            this.onCheckFliter(filter,this.state.dataselect)
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
            <ul className="pagination">
              <li className="page-item"><a className="page-link" style={{ background: "#cfd8dc", width: '100px' }}
                onClick={() => this.pageOnHandleClick("prev")}>Previous</a></li>
              <li className="page-item"><a className="page-link" style={{ background: "#eceff1", width: '100px' }}
                onClick={() => this.pageOnHandleClick("next")}>Next</a></li>
            </ul>
            <p className="float-central" style={{ width: "200px" }}>Page : {this.state.currentPage}</p>
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
        console.log(child)
        if(child.storageObjectChilds.length > 0){
          disQtys = child.storageObjectChilds.map((v)=>{
            return <div>{v.weigthKG + ' ' + v.weigthKG + (v.weigthKG?' : Min ' + v.weigthKG:'') + (v.weigthKG?" : Max "+v.weigthKG:'')}</div>
          });
        }
        else{
          disQtys = <div>{child.weigthKG}</div>
        }
        
         return <ul key={i} style={child.isFocus===true?focus:focusf}>
         <div>{<Link to={'/sys/storage/history?TYPEID=O&ID=' + child.id}>
           
          <span>{child.storageObjectChilds.eventStatus===null?'':child.storageObjectChilds.eventStatus===0?'[WAIT]':'[INV]'} </span>
          <span>{child.baseMaster_Code===null? child.packMaster_Code : child.baseMaster_Code} : {child.baseMaster_Name===null? child.packMaster_Name : child.baseMaster_Name} </span>
          <span>{child.allqty===null?'':'[qty: ' + child.allqty + ']'} </span>
          <span>{child.weigthKG===null?'':'[wei:' + child.weigthKG + 'Kg.]'} </span> 
          </Link>} </div>
          { (child.storageObjectChilds.map(child2 => {
            let z = this.addtolist([child2])
            return z})) 
          }
          
           </ul> 
      })
    }
    subTree(e){
      const getSumChild = this.sumChild(Clone([e.original]))
      return this.addtolist(getSumChild)
    }

    subTable(e){
      if(this.props.subtype === 1){
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

      }
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
      else if (rowdata.column.id==="eventStatus"){
        if(rowdata.row["eventStatus"] === 0){
          return "WAIT"
        }else if(rowdata.row["eventStatus"] !== 0){
          return "INV" 
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
              row.Filter = () => this.createDropdownFilter(row.accessor,this.state.dataselect)
            }
            else if(row.Filter === "select"){
              row.Filter = (e) => this.createSelectAll()
            }

            if(row.Status === "text"){
              row.Cell = (e) => (this.setStatusText(e))
            }

            if(row.Type === "selection"){
              row.Cell = (e) => this.createSelection(e,"checkbox")
              row.className="text-center"
            }else if(row.Type === "button"){
              this.props.btn.find(btnrow => {
                if (row.btntype === "Remove" && btnrow.btntype) {
                  row.Cell = (e) => <Button type="button" style={{ background: "#ef5350", borderColor: "#ef5350"}} color="success"  onClick={() => this.removedata(e.original)}>Remove</Button>
                }
                else{
                  if(row.btntype === btnrow.btntype){
                    row.Cell = (e) => btnrow.func(e.original)
                  }
                }
              })
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
          <div>
            <ReactTableFixedColumns 
            data={this.state.data}
            style={{backgroundColor:'white'}}
            loading={this.state.loading}
            filterable={this.props.filterable}
            columns={col}
            pivotBy={this.props.pivotBy}
            multiSort={false}
            showPagination={true}
            minRows={5}
            SubComponent={this.props.childType==="Table"?this.subTable:this.subTree}
            PaginationComponent={this.paginationButton}
            /* onSortedChange={(sorted) => {
                this.setState({data:[], loading:true });
                this.customSorting(sorted)}
            } *//>
            
            </div>
        )
    }
}

const getLogData = (data) =>{
  
}



export default ExtendTable
