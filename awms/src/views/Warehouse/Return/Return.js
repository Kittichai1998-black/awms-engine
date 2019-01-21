import React, { Component } from 'react';
import "react-table/react-table.css";
import { TableGen } from '../MasterData/TableSetup';
import { AutoSelect, apicall, createQueryString, Clone } from '../ComponentCore'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {
  Input, Button, CardBody, Card, Row, Col,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import ReactTable from 'react-table';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../ComponentCore/Permission';
import { error } from 'util';

const Axios = new apicall()


class Return extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Document: {
        queryString: window.apipath + "/api/trx",
        t: "Document",
        q: "[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002},{ 'f': 'EventStatus', c:'!=', 'v': 24}]",
        f: "ID,Code",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: "",
        l: "",
        all: "",
      },
      DocumentItemSto: {
        queryString: window.apipath + "/api/viw",
        t: "DocItemSto",
        q: "[{ 'f': 'EventStatus', c:'!=', 'v': 24}]",
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: "",
        l: "",
        all: "",
      },
      PalletSto: {
        queryString: window.apipath + "/api/viw",
        t: "PalletSto",
        q: "[{ 'f': 'Status', c:'!=', 'v': 2}]",
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: "",
        l: "",
        all: "",
      },
      DocItem: {
        queryString: window.apipath + "/api/trx",
        t: "DocumentItem",
        q: "[{ 'f': 'Status', c:'!=', 'v': 2}]",
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: "",
        l: "",
        all: "",
      },
      Area:{
        queryString: window.apipath + "/api/mst",
        t: "AreaMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "ID,Code, Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        all: "",
      },
      UnitTypeTable:{
        queryString: window.apipath + "/api/mst",
        t: "UnitType",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "ID,Code",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        all: "",
      },
      BaseMaster:{
        queryString: window.apipath + "/api/mst",
        t: "BaseMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "ID,Code,UnitType_ID",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        all: "",
      },     
      qtyEdit: [],
      dataTable: [],
      IssueDocItem:[],
      docItem:"",
      dataDoc:[],
      dataDocItem:[],
      barcode:"",
      dataFilter:[],
      areaCode:[],
      IssueDocdata:[],
      AreaData:[],
      UnitType:[],
      unittypeCode:[],
      dataSKUinPallet:[],
      Base:[],
      check:""

    }

    this.checkPallet = this.checkPallet.bind(this)
    this.genDocItem = this.genDocItem.bind(this)
    this.createDataCard = this.createDataCard.bind(this)
    this.mappingPallet = this.mappingPallet.bind(this)
    this.genUnitCode = this.genUnitCode.bind(this)
    this.insertToDisto = this.insertToDisto.bind(this)
    this.checkBase = this.checkBase.bind(this)
    this.insertSKUtoOb = this.insertSKUtoOb.bind(this)
  }

  async componentWillMount() {
    document.title = "Return : AWMS";
    let dataGetPer = await GetPermission()
    CheckWebPermission("Return", dataGetPer, this.props.history);
    Axios.get(createQueryString(this.state.Document)).then((response) => {
      const IssueDocdata = []
      response.data.datas.forEach(row => {
        IssueDocdata.push({ value: row.ID, label: row.Code})
      })
      this.setState({ IssueDocdata})
    })

    Axios.get(createQueryString(this.state.Area)).then((response) => {
      const AreaData = []
      response.data.datas.forEach(row => {
        AreaData.push({ value: row.ID, label: row.Code+" : "+row.Name})
      })
      this.setState({ AreaData})
    })
  }

checkBase(){
  let QueryDoc = this.state.BaseMaster
  let JSONDoc = []
  JSONDoc.push({ "f": "Code", "c": "=", "v":this.state.barcode})
  QueryDoc.q = JSON.stringify(JSONDoc)  
  Axios.get(createQueryString(QueryDoc)).then((response) => {
    
    if(response.data.datas.length !== 0){
      const Base = []
      response.data.datas.forEach(row => {
        console.log(row)
        Base.push({ value: row.ID,UnitType_ID:row.UnitType_ID})
      })
      this.setState({ Base})
      this.setState({check:"insert"})
      this.checkPallet(true)
    }else{
      alert("Don't have pallet : "+this.state.barcode +" in system")
    }
  })
}


  genDocItem(data){ 
    this.setState({docIDIssue:data})
    let QueryDoc = this.state.DocItem
    let JSONDoc = []
    JSONDoc.push({ "f": "Document_ID", "c": "=", "v":data})
    QueryDoc.q = JSON.stringify(JSONDoc)  
    Axios.get(createQueryString(QueryDoc)).then((response) => {
      const IssueDocItem = []
      response.data.datas.forEach( x => {
        console.log(x)
        IssueDocItem.push({value: x.ID, label:x.Code,code:x.Code,batch:x.Batch,lot:x.Lot,OrderNo:x.OrderNo,QuantityDocItem:x.Quantity,unitIDDocItem:x.UnitType_ID,baseQty:x.BaseQuantity,baseUnitID:x.BaseUnitType_ID,sku:x.SKUMaster_ID,ProductionDate:x.ProductionDate})
      })
      this.setState({IssueDocItem})
    })
  }

genUnitCode(data,flag){
  console.log(this.state.UnitType)
    let QueryDoc = this.state.UnitTypeTable
    let JSONDoc = []
    JSONDoc.push({ "f": "ID", "c": "=", "v":data})
    QueryDoc.q = JSON.stringify(JSONDoc)  
    Axios.get(createQueryString(QueryDoc)).then((response) => {
      response.data.datas.forEach( x => {
       this.setState({unittypeCode:x.Code})
      })
    this.mappingPallet(this.state.unittypeCode,flag)   
    })
}

  mappingPallet(data,flag){
    console.log(data)
    let postdata = {  
      scanCode: this.state.barcode
      , amount: 1
      , areaID: this.state.AreaID
      , action: 1
      , mode: 0
      , options: null
      , unitCode: data
      , warehouseID: 1
      , mapsto: null
      , isRoot: true
    }
    console.log(postdata)
    Axios.post(window.apipath + "/api/wm/VRMapSTO", postdata).then((res) => {
      console.log(res)
      if (res.data._result.status === 1) {
        if(this.state.check === "insert"){
      var card =this.createDataCard(null,flag,res.data)  
      this.setState({card})
        }else{
          res.data.mapstos.forEach( row =>{
            const dataSKUinPallet = []
            row.mapstos.forEach( x=>{
              console.log(x)
              dataSKUinPallet.push({id:x.id,sku:x.code,qty:x.qty})
            })
            console.log(dataSKUinPallet)      
            this.createDataCard(dataSKUinPallet,flag,null)  
          })  
        }
    }
    })
  }

  insertSKUtoOb(data,map){
    let postdata = {   
        scanCode: this.state.barcode
        , OrderNo : this.state.docItem.OrderNo
        , batch : this.state.docItem.batch
        , lot: this.state.docItem.lot
        , unitCode : data
        , amount: this.state.dataValue
        , productDate : this.state.docItem.ProductionDate
        , areaID: this.state.AreaID
        , action: 1
        , mode: 0
        , options: null
        , warehouseID: 1
        , mapsto: map
        , isRoot: true         
    }
    console.log(postdata)
    //Axios.post(window.apipath + "/api/wm/VRMapSTO", postdata).then((res) => {


    //})
  }

  checkPallet(check){
    console.log(this.state.docItem)
    if(check === true){

      console.log(this.state.barcode)
      let QueryDoc = this.state.PalletSto
      let JSONDoc = []
      JSONDoc.push({ "f": "CodePallet", "c": "=", "v":this.state.barcode})
      QueryDoc.q = JSON.stringify(JSONDoc)  
        Axios.get(createQueryString(QueryDoc)).then((response) => {
        const dataPallet = []
        if( response.data.datas.length === 0){
          this.state.Base.forEach( x =>{
            this.genUnitCode(x.UnitType_ID,true) 
          })
          
        }else{
          response.data.datas.forEach( x => {
            dataPallet.push({value:x.ID,batch:x.Batch,lot:x.Lot,OrderNo:x.OrderNo,pallet:x.CodePallet,code:x.Code,area:x.AreaMaster_ID,unitType:x.UnitTypePallet})
            })
            this.setState({dataPallet},()=>{

    
              if(this.state.docItem.batch === null || this.state.docItem.batch  === ""){
                this.state.docItem.batch = null
              }
              if(this.state.docItem.OrderNo  === null || this.state.docItem.OrderNo   ===" "){
                this.state.docItem.OrderNo  = null
              }
              if(this.state.docItem.lot === null || this.state.docItem.lot  === ""){
                this.state.docItem.lot = null
              }
    
              this.state.dataPallet.forEach(data =>{
                if(data.batch === null || data.batch === ""){
                  data.batch = null
                }
                if(data.lot === null || data.lot === ""){
                  data.lot = null
                }
                if(data.OrderNo === null || data.OrderNo === ""){
                  data.OrderNo = null
                }
                this.state.UnitType = data.unitType
              })
              
                var result = this.state.dataPallet.filter(x=> x.batch === this.state.docItem.batch && 
                  x.lot === this.state.docItem.lot &&
                  x.OrderNo === this.state.docItem.OrderNo && 
                  x.pallet === this.state.barcode &&
                  x.code === this.state.docItem.code)
                var flag = false
                if(result.length != 0){
                  //เพิ่มได้
                  flag = true
                  
                }else{
                  //เพิ่มไม่ได้
                  flag = false
                }
                this.genUnitCode(this.state.UnitType,flag)  
          })   
        } 
      })   
    }
  }


  createDataCard(data,flag,map){

    if(flag){ //เพิ่มได้
      console.log(data)
      if(data === null){

        return <Card>
            <CardBody>
              <div style={{textAlign:"center"}}><label  style={{fontWeight:"bolder"}}>Pallet Detail</label></div>
              <div><label  style={{fontWeight:"bolder"}}>Sku in pallet : </label> - &nbsp;&nbsp;<label  style={{fontWeight:"bolder"}}>qty : </label> - </div>
              <div style={{textAlign:"center"}}><label  style={{textAlign:"center",fontWeight:"bolder"}}>SKU For Return</label></div>
              <div><label  style={{fontWeight:"bolder"}}>Code : </label> {this.state.docItem.code}</div>
              <div><label  style={{fontWeight:"bolder"}}>Qty for return / Qty for Doc : </label> <Input defaultValue={this.state.docItem.QuantityDocItem} style={{ height: "30px", width: "60px", background: "#FFFFE0", display: "inline-block" }} max="" type="number"  onChange={(e) => {
              this.ChangeData(e, e.target.value) }}/> / {this.state.docItem.QuantityDocItem}</div>
              <div><label  style={{fontWeight:"bolder"}}>Unit Type : </label> {this.state.unittypeCode}</div><br/>
              <div style={{textAlign:"center", width: "100%" }}><Button onClick={() => {this.insertSKUtoOb(data,map)}} color="primary" id="per_button_confirm">Confirm</Button></div>
            </CardBody>
          </Card>
        
      }else{
        let QueryDoc = this.state.DocumentItemSto
        let JSONDoc = []
        JSONDoc.push({"f": "Status", "c":"=", "v": 1, "f": "Document_ID", "c": "=", "v": this.state.docIDIssue })
        QueryDoc.q = JSON.stringify(JSONDoc)
        data.forEach(dataPallet =>{
        Axios.get(createQueryString(QueryDoc)).then((res) => {
          console.log(res)
          var dataCard = res.data.datas.map((list,index) => {
           
              console.log(dataPallet.sku)
          return <Card key={index}>
            <CardBody>
              <div style={{textAlign:"center"}}><label  style={{fontWeight:"bolder"}}>Pallet Detail</label></div>
              <div><label  style={{fontWeight:"bolder"}}>Sku in pallet : </label> {dataPallet.sku}&nbsp;&nbsp;<label  style={{fontWeight:"bolder"}}>qty : </label> {dataPallet.qty} </div>
              <div style={{textAlign:"center"}}><label  style={{textAlign:"center",fontWeight:"bolder"}}>SKU For Return</label></div>
              <div><label  style={{fontWeight:"bolder"}}>Code : </label> {list.Code}</div>
              <div><label  style={{fontWeight:"bolder"}}>Qty for return / Qty for Doc : </label> <Input defaultValue={list.Quantity} style={{ height: "30px", width: "60px", background: "#FFFFE0", display: "inline-block" }} max="" type="number"  onChange={(e) => {
              this.ChangeData(e, e.target.value) }}/> / {this.state.docItem.QuantityDocItem}</div>
              <div><label  style={{fontWeight:"bolder"}}>Unit Type : </label> {list.UnitTypeName}</div><br/>
              <div style={{textAlign:"center", width: "100%" }}><Button onClick={() => {this.insertToDisto(dataPallet.id)}} color="primary" id="per_button_confirm">Confirm</Button></div>
            </CardBody>
          </Card>
            
          })
            this.setState({displayDataCard : dataCard})
          })
        })
      }
    }else{
      //เพิ่มไม่ได้
     alert("Cannot use Pallter : "+this.state.barcode)     
    }
  }

  
  ChangeData(e,dataValue) {
    e.target.style.background = "yellow"
    this.setState({dataValue})
    console.log(dataValue)
  }
  
insertToDisto(StoId){
    this.state.IssueDocItem.forEach(x=>{
      if(this.state.dataValue !== undefined){
        let  postdata = {  
          ID: null
          , documentItemID: x.value
          , StorageObjectID: StoId
          , qty: this.state.dataValue
          , unitID: x.unitIDDocItem
          , baseUnitID: x.baseUnitID
          , status: 1
          , actionBy: localStorage.User_ID 
          , sku: x.sku
        }
        console.log(postdata)
          Axios.post(window.apipath + "/api/wm/issued/doc/return",postdata).then((res) => {
            if(res.data._result.status === 1){
              window.success(res.data._result.message)
            }else{
              alert(res.data._result.message)
            }
          })
          }else{

            alert("Please input Qty for SKU")

          }
      })

}




  dropdownAuto() {
    return <div>
      <label style={{width: '100%', display: "inline-block", marginRight: "10px" }}>Issue Doc : </label><br/>
      <div style={{textAlign:"center", display: "inline-block", width: "100%"}}>
        <AutoSelect data={this.state.IssueDocdata} result={(res) => {this.genDocItem(res.value) }} />
      </div>
    </div>
  }


  render() {    
    return (
      <div>
        
          {this.dropdownAuto()}       

          <label style={{width: '100%', display: "inline-block", marginRight: "10px" }}>SKU : </label><br/>
          <div style={{textAlign:"center", display: "inline-block", width: "100%", }}><AutoSelect data={this.state.IssueDocItem} result={(e) => this.setState({ "docItem": e})}  /></div><br/>
    
          <label style={{width: '100%', display: "inline-block", marginRight: "10px" }}>Area : </label><br/>
          <div style={{textAlign:"center", display: "inline-block", width: "100%", }}><AutoSelect data={this.state.AreaData} result={(e) => this.setState({ "AreaID": e.value})}  /></div><br/>

          <label style={{width: '100%', display: "inline-block",  marginRight: "10px" }}>Barcode Pallet : </label><br/>
            <Input id="barcodetext" style={{textAlign:"center", width: '100%', display: 'inline-block' }} type="text"
              value={this.state.barcode} placeholder="Barcode"
              onChange={e => { this.setState({ barcode: e.target.value }) }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && this.state.barcode !== "") {                 
                  this.checkBase()
                }
              }} />{' '}<br/>
        <br />
        {this.state.displayDataCard}
        {this.state.card}
      </div>
    )
  }
}

export default Return;
