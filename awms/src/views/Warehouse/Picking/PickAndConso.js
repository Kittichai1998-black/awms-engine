import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Button, Nav, NavItem, NavLink, Row,Col, TabContent, TabPane } from 'reactstrap';
import ReactTable from 'react-table'
import {AutoSelect, Clone, apicall,createQueryString} from '../ComponentCore'
//import Axios from 'axios';
import {EventStatus} from '../Status'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classnames from 'classnames';
import _ from 'lodash'
import GetPermission from '../../ComponentCore/Permission';

const Axios = new apicall()

class PickAndConso extends Component{
  constructor(props) {
    super(props);
    this.state ={
      disableconso:true,
      mapsto:null,
      data:[],
      autocomplete:[],
      autoresult:[],
      auto_customer:[],
      modalstatus:false,
      rSelect:0,
      consoStatus:2,
      pickingAmount:1,
      pickingBarcode:"",
      loadIssued:true,
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
      activeTab: '1',
      openGuild:'none'
    }
    this.renderTable = this.renderTable.bind(this)
    this.toggleTab = this.toggleTab.bind(this)
    this.selectMode = this.selectMode.bind(this)
    this.onHandleClickPickingScan = this.onHandleClickPickingScan.bind(this)
    this.onClickDocumentItemDetail = this.onClickDocumentItemDetail.bind(this)
    this.createGuideLocation = this.createGuideLocation.bind(this)
    this.clearTable = this.clearTable.bind(this)
    this.getIssuedList = this.getIssuedList.bind(this)
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)

    this.customerselect = {queryString:window.apipath + "/api/mst",
    t:"Customer",
    q:'[{ "f": "Status", "c":"=", "v": 1}]',
    f:"ID,Code, Name",
    g:"",
    s:"[{'f':'ID','od':'asc'}]",
    sk:0,
    all:"",}

  }

  componentWillMount(){
    Axios.get(createQueryString(this.customerselect)).then(res => {
      this.setState({auto_customer : res.data.datas}, () => {
        const auto_customer = []
        this.state.auto_customer.forEach(row => {
          auto_customer.push({value:row.ID, label:row.Code + ' : ' + row.Name })
        })
        this.setState({auto_customer})
      })
    })
    //permission
    this.setState({showbutton:"none"})
    GetPermission(this.displayButtonByPermission)
    //permission
 
  }
  //permission
displayButtonByPermission(perID){

  this.setState({perID:perID})
  let check = false
  perID.forEach(row => {
      if(row === 29){
        check = true
      }else if(row === 30){
        check = false
      }
    })
       if(check === true){  
          var PerButtonPush = document.getElementById("per_button_tap")
          PerButtonPush.remove()      
       }else if(check === false){
          this.setState({showbutton:"block"})
       }
  }
  //permission

  getIssuedList(){
    const select={queryString:window.apipath + "/api/viw",
      t:"Document",
      q:"[{ 'f': 'Des_Customer_ID', c:'=', 'v': "+ this.state.customervalue +"},{ 'f': 'DocumentType_ID', c:'=', 'v': 1002},{ 'f': 'status', c:'=', 'v': 1}]",
      f:"ID, Code, Remark",
      g:"",
      s:"[{'f':'DesCustomerName','od':'asc'}]",
      sk:0,
      l:0,
      all:"",}

      Axios.get(createQueryString(select)).then((rowselect) => {
        const autocomplete = []
        rowselect.data.datas.forEach(row => {
          autocomplete.push({value:row.ID, label: row.Code, remark: row.Remark})
        })
        this.setState({autocomplete})
      })
  }

  renderTable(data){
    this.setState({rowselect:data, loadIssued:false})
    const documentItem = this.state.documentItem
    const documentItemCon = []
    documentItemCon.push({ 'f': 'Document_ID', c:'in', 'v': data},{ 'f': 'Status', c:'!=', 'v': 2},{'f':'documentType_ID','c':'=','v':'1002'})
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
          const filterPickItem = countrow.data.datas.filter(frow => frow.DocumentItem_ID === row.ID)
          if(filterPickItem.length > 0){
            countrow.data.datas.forEach(crow => {
              if(row.ID === crow.DocumentItem_ID){
                row.Quantity = crow.qty + "/" + row.Quantity         
              }

            })
          }
          else{
            row.Quantity = 0 + "/" + row.Quantity
          }
        })
        this.setState({data:initdata}, () => {
          this.createGuideLocation()
        })
      })
    })
  }
  
  toggleTab(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({activeTab: tab}, () => {
        if(tab !== 3){
          this.setState({
            consoBarcode:"",
            pickingBarcode:"",
            pickingAmount:1,
            mapsto:null,
            pickingList:null
          })
        }
      });
    }
  }
  
  createGuideLocation(){
    const data =  this.state.data
    let docItemsStr = ""
    data.forEach(row => {
      const qty = row.Quantity.split("/")
      if(qty[0] !== qty[1])
        docItemsStr += "," + row.ID;
    })
    let guideLoc = []
    if(docItemsStr !== ""){
      Axios.get(window.apipath + '/api/wm/issued/location/canpick?docItemIDs=' + docItemsStr.substring(1)).then(res => {
        if(res.data.datas.length != 0){
          this.setState({openGuild:"block"})
        }else{
          this.setState({openGuild:"none"})
        }
        let grouplocation = _.groupBy(res.data.datas,"code")
        let groupdata = []
        for(let row in grouplocation){
          groupdata.push(grouplocation[row][0])
        }
        for( let i= 0; i <5 && i < groupdata.length;i++){

          let resultData =groupdata[i]
          guideLoc.push(<button type="button" class="btn btn-secondary" style={{margin:'3px'}} key={i} >{resultData.areaLocationCode === null ? null:resultData.areaLocationCode + '-'} {resultData.areaCode} - {resultData.code} </button>)     
        }
        if (groupdata.length > 5){
          guideLoc.push(<span>...</span>)
        }
        this.setState({guideLoc})
        // const reselement = res.data.datas.map((row,i) => {
        //   return  <button type="button" class="btn btn-secondary" style={{margin:'3px'}} key={i} >{row.areaLocationCode === null ? null:row.areaLocationCode + '-'} {row.areaCode} - {row.code}  </button>
        // })
        // this.setState({guideLoc:reselement})
      }).catch(res => {alert(res)})
    }
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

  createDocumentItemList(data){
    const focus = {color:'red', marginLeft:"-20px", fontSize:"13px"}
    const focusf = {color:'green', marginLeft:"-20px", fontSize:"13px"}
    return data.map((rowdata, index) => {
      return <ul key={index} style={rowdata.isFocus===true?focus:focusf}>
        <span>{this.getStatusName(rowdata.eventStatus)}</span><span><FontAwesomeIcon icon="pallet"/>{rowdata.code} : {rowdata.name}/</span>
        <span><FontAwesomeIcon icon="layer-group"/> {rowdata.objectSizeName} /</span><span>Qty : {rowdata.allqty} /</span><span>Weight : {rowdata.weiKG}</span>
        {this.createDocumentItemList(rowdata.mapstos)}
      </ul>
    })
  }

  onClickDocumentItemDetail(){
    Axios.get(window.apipath + "/api/wm/issued/sto/indoc/?docID=" + this.state.rowselect).then((res) => {
      const sumdata = this.sumChild(res.data.mapstos)
      const popupElement = this.createDocumentItemList(sumdata)
      this.setState({popupElement:popupElement}, () => {
        if(this.state.popupElement.length == 0)
          alert("No Found Data!!")
      })
    })
  }

  async createPickingItemList(data){
    const focus = {color:'red', marginLeft:"-20px", fontSize:"13px"}
    const focusf = {color:'green', marginLeft:"-20px", fontSize:"13px"}
    return data.map((rowdata, index) => {
      return <ul key={index} style={rowdata.isFocus===true?focus:focusf}>
        <span>{this.getStatusName(rowdata.eventStatus)} /</span><span><FontAwesomeIcon icon="pallet"/>{rowdata.code} : {rowdata.name}/</span>
        <span><FontAwesomeIcon icon="layer-group"/> {rowdata.objectSizeName} /</span><span>Qty : {rowdata.allqty} /</span><span>Weight : {rowdata.weiKG} </span>
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
        baseCode:this.state.consoBarcode !== "" || this.state.consoBarcode !== undefined ? this.state.consoBarcode : null,
        scanCode:this.state.pickingBarcode,
        docID:this.state.rowselect,
        amount:this.state.pickingAmount,
        action: null,
        mapsto:this.state.mapsto
      }
      Axios.post(window.apipath + "/api/wm/issued/sto/pickConso", data).then((res) => {
        if(res.data._result.status === 1){
          window.success("เรียบร้อย")
          if(res.data.mapsto){
            this.setState({mapsto:res.data.mapsto}, () => {
              const clonemapsto = Clone(this.state.mapsto)
              let header = clonemapsto
              header.mapstos = this.sumChild(clonemapsto.mapstos)
              this.createPickingItemList([header]).then(e => this.setState({pickingList:e}))
            })
          }
        }
        this.renderTable(this.state.rowselect)
      })
    }
    
    this.setState({pickingBarcode:"",pickingAmount:1})
    if(this.state.activeTab === 1){
      document.getElementById("pickcode").focus()
    }
    else if(this.state.activeTab === 2){
      document.getElementById("pickconso").focus()
    }
  }

  clearTable(){
    this.setState({pickingBarcode:null,consoBarcode:null, pickingAmount:1, pickingList:null, popupElement:null,mapsto:null})
    
  }

  render(){
    const cols = [
      {accessor:"Pack",Header:"Pack Item"},
      {accessor:"Quantity",Header:"PackQty"},
      {accessor:"UnitType",Header:"UnitType"},
    ]

    return(
      <div style={{paddingBottom:'100px'}}>
        <Row>
          <Col sm="1" xs="2"><label style={{paddingTop:"7px"}}>Customer</label></Col>
          <Col sm="11" xs="10"><AutoSelect data={this.state.auto_customer} result={(e) => {this.setState({"customervalue":e.value, "customertext":e.label}, () => this.getIssuedList())}}/></Col>
        </Row>
        <Row>
          <Col sm="1" xs="2"><label style={{paddingTop:"7px"}}>Issued</label></Col>
          <Col sm="11" xs="10"><AutoSelect selectfirst={false} data={this.state.autocomplete} result={result => {this.renderTable(result.value); this.setState({remark:result.remark})}}/></Col>
        </Row>
        <Row>
          <Col sm="12" xs="12"><label>Remark :</label>{this.state.remark}</Col>
        </Row>
        <ReactTable NoDataComponent={() => null} data={this.state.data} columns={cols} minRows={3} showPagination={false}  style={{backgroundColor:"white"}}/>
        <div>

          <div style={{display:this.state.openGuild, fontSize:"18px", color:"red"}}>Guide for Picking : {this.state.guideLoc}</div>
        </div>
        <div id="per_button_tap" style={{display:this.state.showbutton}}>
            <Nav tabs >
              <NavItem>
                <NavLink disabled={this.state.loadIssued}
                  className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggleTab('1'); }}>Pick</NavLink>
              </NavItem>
              <NavItem>
                <NavLink disabled={this.state.loadIssued}
                  className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggleTab('2'); }}>Conso</NavLink>
              </NavItem>
              <NavItem>
                <NavLink disabled={this.state.loadIssued}
                  className={classnames({ active: this.state.activeTab === '3' })} onClick={() => { this.toggleTab('3'); this.onClickDocumentItemDetail()}}>View</NavLink>
                </NavItem>
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="1">
                <label>Picking : </label>
                <Input id="pickcode" placeholder="Barcode" autoFocus type="text" value={this.state.pickingBarcode} onChange={e => this.setState({pickingBarcode:e.target.value})} onKeyPress={e => {
                  if(e.key === "Enter"){
                    this.onHandleClickPickingScan()
                  }
                }} style={{display:"inline-block", width:"180px"}}/>
                <Input id="pickqty" placeholder="Amount" type="text" value={this.state.pickingAmount} onChange={e => this.setState({pickingAmount:e.target.value})} style={{display:"inline-block", width:"100px"}}/>
                <Button color="primary" style={{ display: "inline", background: "#26c6da", borderColor: "#26c6da", width: '100px'}}
                  onClick={() => this.onHandleClickPickingScan()}>Post</Button>
                <Button color="primary" style={{ display: "inline", background: "#26c6da", borderColor: "#26c6da", width: '100px'}}
                  onClick={this.clearTable} >Clear</Button>
                <div>
                  {this.state.pickingList}
                </div>
              </TabPane>
              <TabPane tabId="2">
                <label>Conso : </label><Input value={this.state.consoBarcode} type="text" placeholder="Input Base" autoFocus onChange={e => this.setState({consoBarcode:e.target.value})} style={{display:"inline-block", width:"200px"}}/>
                <br/>
                <label>Picking : </label>
                <Input id="pickconso" placeholder="Barcode" type="text" value={this.state.pickingBarcode} onChange={e => this.setState({pickingBarcode:e.target.value})} onKeyPress={e => {
                  if(e.key === "Enter"){
                    this.onHandleClickPickingScan()
                  }
                }} style={{display:"inline-block", width:"180px"}}/>
                <Input id="qtyconso" placeholder="Amount" type="text" value={this.state.pickingAmount} onChange={e => this.setState({pickingAmount:e.target.value})} style={{display:"inline-block", width:"100px"}}/>
                <Button color="primary" style={{ display: "inline", background: "#26c6da", borderColor: "#26c6da", width: '100px'}}
                  onClick={() => this.onHandleClickPickingScan()}>Post</Button>
                <Button color="primary" style={{ display: "inline", background: "#26c6da", borderColor: "#26c6da", width: '100px'}}
                  onClick={this.clearTable} >Clear</Button>
                <div>
                  {this.state.pickingList}
                </div>
              </TabPane>
              <TabPane tabId="3">
                <div>
                  {this.state.popupElement}
                </div>
              </TabPane>
            </TabContent>
          </div>
      </div>
    )
  }
}

export default PickAndConso;
