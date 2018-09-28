import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Modal, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, ButtonGroup, Alert, Row,Col } from 'reactstrap';
import ReactTable from 'react-table'
import {AutoSelect, Clone} from '../ComponentCore'
import Axios from 'axios';
import EventStatus from '../EventStatus'

const createQueryString = (select) => {
  let queryS = select.queryString + (select.t === "" ? "?" : "?t=" + select.t)
  + (select.q === "" ? "" : "&q=" + select.q)
  + (select.f === "" ? "" : "&f=" + select.f)
  + (select.g === "" ? "" : "&g=" + select.g)
  + (select.s === "" ? "" : "&s=" + select.s)
  + (select.sk === "" ? "" : "&sk=" + select.sk)
  + (select.l === 0 ? "" : "&l=" + select.l)
  + (select.all === "" ? "" : "&all=" + select.all)
  return queryS
}

class Loading extends Component{
  constructor(props) {
    super(props);
    this.state ={
      disableconso:true,
      mapsto:null,
      data:[],
      autoresult:[],
      modalstatus:false,
      rSelect:0,
      consoStatus:2,
      documentItem:{queryString:window.apipath + "/api/viw",
      t:"DocumentItem",
      q:'',
      f:"ID, Code, concat(PackMaster_Code, ' : ', PackMaster_Name) AS Pack, concat(SKUMaster_Code, ' : ', SKUMaster_Name) AS SKU, UnitType_Name AS UnitType, Quantity",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:0,
      all:"",},
      documentItemCount:{queryString:window.apipath + "/api/trx",
      t:"DocumentItemStorageObject",
      q:"",
      f:"count(1) as qty, DocumentItem_ID",
      g:"DocumentItem_ID",
      s:"",
      sk:"",
      l:0,
      all:"",},
    }
    this.renderTable = this.renderTable.bind(this)
    this.toggle = this.toggle.bind(this)
    this.selectMode = this.selectMode.bind(this)
    this.onHandleClickPickingScan = this.onHandleClickPickingScan.bind(this)
    this.onClickDocumentItemDetail = this.onClickDocumentItemDetail.bind(this)

    this.select={queryString:window.apipath + "/api/viw",
      t:"Document",
      q:"[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002},{ 'f': 'status', c:'=', 'v': 1},{ 'f': 'eventStatus', c:'=', 'v': 11}]",
      f:"ID,Code",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:0,
      all:"",}
  }

  componentDidMount(){
    console.log(window.apipath)
    Axios.get(createQueryString(this.select)).then((rowselect) => {
      const autocomplete = []
      rowselect.data.datas.forEach(row => {
        autocomplete.push({value:row.ID, label: row.Code})
      })
      this.setState({autocomplete})
    })
  }
  
  renderTable(data){
    const documentItem = this.state.documentItem
    const documentItemCon = []
    documentItemCon.push({ 'f': 'Document_ID', c:'in', 'v': data.map(row => row.value).join(',')},{ 'f': 'eventStatus', c:'=', 'v': 11},{'f':'documentType_ID','c':'=','v':'1002'})
    documentItem.q = JSON.stringify(documentItemCon)
    this.setState({documentItem:documentItem})

    Axios.get(createQueryString(documentItem)).then((rowselect) => {
      this.setState({data:rowselect.data.datas})
      return rowselect.data.datas.map(x=> x.ID)
    }).then((res) => {
      const documentItemCount = this.state.documentItemCount
      documentItemCount.q = JSON.stringify([{f:'status',c:'!=',v:'2'},{f:'DocumentItem_ID',c:'in',v:res.join(',')}])
      this.setState({documentItemCount:documentItemCount})

      Axios.get(createQueryString(documentItemCount)).then((countrow) => {
        const initdata = this.state.data
        initdata.forEach(row => {
          console.log(row.ID)
          countrow.data.datas.forEach(crow => {
            console.log(crow.qty)
            if(row.ID === crow.DocumentItem_ID){
              row.Quantity = crow.qty + "/" + row.Quantity
            }
          })
        })
        this.setState({data:initdata})
      })
    })
  }

  toggle() {
    this.setState({modalstatus:!this.state.modalstatus}, () =>  console.log(this.state.modalstatus));
  }
  
  sumChild(data){
    let getdata = []
    data.forEach(row1 => {
      let xx = getdata.filter(row => row.code == row1.code)
      if(xx.length > 0){
        let qty = xx[0].allqty
        xx[0].allqty = xx[0].allqty + 1
        if(row1.mapstos.length > 0)
          this.sumChild(row1.mapstos)
      }
      else{
        row1.allqty = 1
        getdata.push(row1)
        row1.mapstos = this.sumChild(row1.mapstos)
      }
    })
    return getdata
  }

  selectMode(mode){
    this.setState({rSelect:mode})
  }

  getStatusName(status){
    const res = EventStatus.filter(row => {
      return row.code === status
    })
    return res.map(row => row.status)
  }
  
  createDocumentItemList(data){
    return data.map((rowdata, index) => {
      return <ul key={index}>
        <span>{this.getStatusName(rowdata.eventStatus)} //</span><span>{rowdata.code} : {rowdata.name}//</span>
        <span>Object Name{rowdata.objectSizeName} //</span><span>Qty : {rowdata.allqty} //</span><span>Weight : {rowdata.weiKG} //</span>
        {this.createDocumentItemList(rowdata.mapstos)}
      </ul>
    })
  }

  onClickDocumentItemDetail(data){
    Axios.get(window.apipath + "/api/wm/issued/sto/indoc/?docItemID=" + data.ID).then((res) => {
      const sumdata = this.sumChild(res.data.mapstos)
      const popupElement = this.createDocumentItemList(sumdata)
      this.setState({popupElement:popupElement}, () => {this.toggle()})
    })
  }

  createModal(){
      return <Modal isOpen={this.state.modalstatus}>
               <ModalHeader toggle={this.toggle}></ModalHeader>
               <ModalBody>
                 <div>
                   {this.state.popupElement}
                 </div>
               </ModalBody>
               <ModalFooter>
                 <Button color="secondary" id="off" onClick={this.toggle}>Close</Button>
              </ModalFooter>
            </Modal>
  }

  createPickingList(data){
    return data.map((rowdata, index) => {
      return <ul>
        <span>{this.getStatusName(rowdata.eventStatus)} //</span><span>{rowdata.code} : {rowdata.name}//</span>
        <span>Object Name : {rowdata.objectSizeName} //</span><span>Qty : {rowdata.allqty} //</span><span>Weight : {rowdata.weiKG} //</span>
        {this.createDocumentItemList(rowdata.mapstos)}
      </ul>
    })
  }

  async createPickingItemList(data){
    return data.map((rowdata, index) => {
      return <ul key={index}>
        <span>{this.getStatusName(rowdata.eventStatus)} //</span><span>{rowdata.code} : {rowdata.name}//</span>
        <span>Object Name{rowdata.objectSizeName} //</span><span>Qty : {rowdata.allqty} //</span><span>Weight : {rowdata.weiKG} //</span>
        {this.createDocumentItemList(rowdata.mapstos)}
      </ul>
    })
  }

  onHandleClickCheckConso(data,barcode){
    console.log(data & barcode)
    if(data && barcode){
      Axios.get(window.apipath + "/api/wm/issued/bsto/canconso?docID=" + data.ID + "&baseCode=" + barcode).then((res) => {
        this.setState({consoStatus:res.data._result.status})
      })
    }
  }

  onHandleClickPickingScan(){
    if(this.state.rowselect){
      const data = {
        baseCode:this.state.consoBarcode ? this.state.consoBarcode : null,
        scanCode:this.state.pickingBarcode,
        docItemID:this.state.rowselect.ID,
        amount:this.state.pickingAmount,
        action: this.state.rSelect,
        mapsto:this.state.mapsto
      }
      Axios.post(window.apipath + "/api/wm/issued/sto/pickConso", data).then((res) => {
        if(res.data.mapsto){
          this.setState({mapstos:res.data.mapsto}, () => {
            const clonemapsto = Clone(this.state.mapstos)
            let header = clonemapsto
            header.mapstos = this.sumChild(clonemapsto.mapstos)
            this.createPickingItemList([header]).then(e => this.setState({pickingList:e}))
          })
        }
      })
    }
  }

  render(){
    const cols = [
      {Header: '', Cell:e => <input name="selection" type="radio" onChange={() => {this.setState({rowselect:e.original})}}/>
      , sortable:false, filterable:false, className:"text-center"},
      {accessor:"Pack",Header:"Pack Item"},
      {accessor:"SKU",Header:"SKU"},
      {accessor:"Quantity",Header:"PackQty"},
      {accessor:"UnitType",Header:"UnitType"},
      {Cell:e => <Button color="primary" onClick={() => this.onClickDocumentItemDetail(e.original)}>Detail</Button>
      , sortable:false, filterable:false, className:"text-center"}
    ]

    return(
      <div>
        <label>Car No : </label><AutoSelect/><Button></Button>
        <label>Issued No : </label><AutoSelect/>
      </div>
    )
  }
}

export default Loading;
