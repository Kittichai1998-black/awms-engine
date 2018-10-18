import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Modal, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, ButtonGroup, Alert, Row,Col } from 'reactstrap';
import ReactTable from 'react-table'
import {AutoSelect, Clone, apicall,createQueryString} from '../ComponentCore'
//import Axios from 'axios';
import {EventStatus} from '../Status'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Axios = new apicall()

class PickAndConso extends Component{
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
    this.createGuideLocation = this.createGuideLocation.bind(this)

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
          countrow.data.datas.forEach(crow => {
            if(row.ID === crow.DocumentItem_ID){
              row.Quantity = crow.qty + "/" + row.Quantity
            }
          })
        })
        this.setState({data:initdata}, () => console.log(this.state.data))
      })
    })
  }

  toggle() {
    this.setState({modalstatus:!this.state.modalstatus});
  }
  
  createGuideLocation(){
    Axios.get(window.apipath + '/api/wm/issued/location/canpick?docItemID=' + this.state.rowselect.ID).then(res => {
      const reselement = <div>
        <span>{res.AreaCode}</span>
      </div>
    })
  }

  sumChild(data){
    let getdata = []
    data.forEach(row1 => {
      let xx = getdata.filter(row => row.code === row1.code)
      if(xx.length > 0){
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
  
  createDocumentItemList(data){
    const focus = {color:'red', marginLeft:"-20px", fontSize:"13px"}
    const focusf = {color:'green', marginLeft:"-20px", fontSize:"13px"}
    return data.map((rowdata, index) => {
      return <ul key={index} style={rowdata.isFocus===true?focus:focusf}>
        <span>{this.getStatusName(rowdata.eventStatus)} /</span><span>{rowdata.code} : {rowdata.name}/</span>
        <span>Object Name{rowdata.objectSizeName} /</span><span>Qty : {rowdata.allqty} /</span><span>Weight : {rowdata.weiKG}</span>
        {this.createDocumentItemList(rowdata.mapstos)}
      </ul>
    })
  }

  onClickDocumentItemDetail(data){
    Axios.get(window.apipath + "/api/wm/issued/sto/indoc/?docItemID=" + data.ID).then((res) => {
      const sumdata = this.sumChild(res.data.mapstos)
      const popupElement = this.createDocumentItemList(sumdata)
      this.setState({popupElement:popupElement}, () => {
        if(this.state.popupElement.length !== 0)
          this.toggle()
        else
          alert("No Found Data!!")
      })
    })
  }

  async createPickingItemList(data){
    const focus = {color:'red', marginLeft:"-20px", fontSize:"13px"}
    const focusf = {color:'green', marginLeft:"-20px", fontSize:"13px"}
    return data.map((rowdata, index) => {
      return <ul key={index} style={rowdata.isFocus===true?focus:focusf}>
        <span>{this.getStatusName(rowdata.eventStatus)} /</span><span>{rowdata.code} : {rowdata.name}/</span>
        <span>Object Name{rowdata.objectSizeName} /</span><span>Qty : {rowdata.allqty} /</span><span>Weight : {rowdata.weiKG} </span>
        {this.createDocumentItemList(rowdata.mapstos)}
      </ul>
    })
  }

  onHandleClickCheckConso(data,barcode){
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
      {Header: '', Cell:e => <input name="selection" type="radio" onChange={() => {this.setState({rowselect:e.original}, () => {this.createGuideLocation()})}}/>
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
        {this.createModal()}
        <Row>
          <Col sm="1" xs="2"><label style={{paddingTop:"7px"}}>Issued</label></Col>
          <Col sm="11" xs="10"><AutoSelect data={this.state.autocomplete} multi={true} result={result => this.renderTable(result)}/></Col>
        </Row>
        <ReactTable NoDataComponent={() => null} data={this.state.data} columns={cols} minRows={3} showPagination={false}  style={{backgroundColor:"white"}}/>
        <div>
          <label>Barcode : </label><Input type="text" onChange={e => this.setState({consoBarcode:e.target.value})} style={{display:"inline-block", width:"200px"}}/>
          <Button color="primary" onClick={() => this.onHandleClickCheckConso(this.state.rowselect, this.state.consoBarcode)} style={{display:"inline"}}>Scan</Button>
          <Button color="danger" onClick={() => this.setState({consoStatus:2})} style={{display:"inline-block"}}>Clear Result</Button>
          <Alert color={this.state.consoStatus === 0 ? "danger" : this.state.consoStatus === 1 ? "success" : "primary"} style={{display:"inline-block"}}>
            {this.state.consoStatus === 0 ? "Can't Use" : this.state.consoStatus === 1 ? "Ready" : "Unset"}
          </Alert>
        </div>
        <Card>
          <CardBody>
            <ButtonGroup style={{margin:'0 0 10px 0',}}>
              <Button color="primary" style={{zIndex:0}} onClick={() => this.selectMode(0)} active={this.state.rSelect === 0}>Focus</Button>
              <Button color="primary" style={{zIndex:0}} onClick={() => this.selectMode(2)} active={this.state.rSelect === 2} disabled={this.state.consoStatus === 0 ? true : false}>Consolidate</Button>
            </ButtonGroup>
            <div>
              <label>Picking : </label>
              <Input placeholder="Barcode" type="text" value={this.state.pickingBarcode} onChange={e => this.setState({pickingBarcode:e.target.value})} style={{display:"inline-block", width:"180px"}}/>
              <Input placeholder="Amount" type="text" value={this.state.pickingAmount} onChange={e => this.setState({pickingAmount:e.target.value})} style={{display:"inline-block", width:"100px"}}/>
              <Button color="primary" style={{display:"inline"}} onClick={() => this.onHandleClickPickingScan()}>Scan</Button>
              <Button color="danger" style={{display:"inline-block"}} onClick={() => this.setState({pickingList:null, pickingAmount:1, pickingBarcode:""})}>Clear Result</Button>
            </div>
            <div>
              {this.state.pickingList}
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default PickAndConso;
