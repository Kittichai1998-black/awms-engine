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
      qtyEdit: [],
      dataTable: [],
      IssueDocItem:[],
      docItem:"",
      dataDoc:[],
      dataDocItem:[],
      barcode:"",
      dataFilter:[]

    }

    //this.createListTable = this.createListTable.bind(this)
    this.checkPallet = this.checkPallet.bind(this)
    this.genDocItem = this.genDocItem.bind(this)
    //this.createPickItem = this.createPickItem.bind(this)
    this.createDataCard = this.createDataCard.bind(this)

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
  }
  
  genDocItem(data){ 
    this.setState({docIDIssue:data})
    let QueryDoc = this.state.DocItem
    let JSONDoc = []
    JSONDoc.push({ "f": "Document_ID", "c": "=", "v":data})
    QueryDoc.q = JSON.stringify(JSONDoc)  
    Axios.get(createQueryString(QueryDoc)).then((response) => {
      const IssueDocItem = []
      console.log(response)
      response.data.datas.forEach( x => {
        console.log(x)
        IssueDocItem.push({value: x.Code, label:x.Code,batch:x.Batch,lot:x.Lot,OrderNo:x.OrderNo,QuantityDocItem:x.Quantity})
      })
      this.setState({IssueDocItem})
      console.log(this.state.IssueDocItem)
    })

  }


  checkPallet(){

    console.log(this.state.barcode)
    let QueryDoc = this.state.PalletSto
    let JSONDoc = []
    JSONDoc.push({ "f": "CodePallet", "c": "=", "v":this.state.barcode})
    QueryDoc.q = JSON.stringify(JSONDoc)  
      Axios.get(createQueryString(QueryDoc)).then((response) => {
      console.log(response)
      const dataPallet = []
      response.data.datas.forEach( x => {
        console.log(x)
        dataPallet.push({value:x.ID,batch:x.Batch,lot:x.Lot,OrderNo:x.OrderNo,pallet:x.CodePallet,code:x.Code})
        })
        this.setState({dataPallet},()=>{
          console.log(this.state.dataPallet)

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
          })
          
            var result = this.state.dataPallet.filter(x=> x.batch === this.state.docItem.batch && 
              x.lot === this.state.docItem.lot &&
              x.OrderNo === this.state.docItem.OrderNo && 
              x.pallet === this.state.barcode &&
              x.code === this.state.docItem.value)
              console.log(result)
            console.log(result.length)
            var flag = false
            if(result.length != 0){
              //เพิ่มได้
              flag = true
              
            }else{
              //เพิ่มไม่ได้
              flag = false
            }    
            this.createDataCard(flag)
            console.log(flag)       
      })
    })
  }

  createDataCard(flag){

    if(flag){ //เพิ่มได้
      let QueryDoc = this.state.DocumentItemSto
      let JSONDoc = []
      JSONDoc.push({ "f": "Document_ID", "c": "=", "v": this.state.docIDIssue })
      QueryDoc.q = JSON.stringify(JSONDoc)
      Axios.get(createQueryString(QueryDoc)).then((res) => {
        console.log(res)
        var dataCard = res.data.datas.map((list,index) => {
        return <Card key={index}>
          <CardBody>
            <div><label  style={{fontWeight:"bolder"}}>Code : </label> {list.Code}</div>
            <div><label  style={{fontWeight:"bolder"}}>Qty : </label> <Input defaultValue={list.Quantity} style={{ height: "30px", width: "60px", background: "#FFFFE0", display: "inline-block" }} max="" type="number"  onChange={(e) => {
            this.ChangeData(e, e.target.value) }}/> / {this.state.docItem.QuantityDocItem}</div>
            <div><label  style={{fontWeight:"bolder"}}>Unit Type : </label> {list.UnitTypeName}</div><br/>
            <div style={{textAlign:"center", width: "100%" }}><Button color="primary" id="per_button_confirm">Confirm</Button></div>
          </CardBody>
        </Card>
          })
          this.setState({displayDataCard : dataCard})
        })
    }else{
      //เพิ่มไม่ได้
     alert("Cannot use Pallter : "+this.state.barcode)     
    }
  }

  
  ChangeData(e,dataValue) {
    e.target.style.background = "yellow"
    let rootdata
    //let data = this.state.qtyEdit
    // data.forEach((row, index) => {
    //   if (row.baseStoID === dataParent) {
    //     data.splice(index, 1)
    //   }
    // })
    // data.push({ baseStoID: dataParent, packStoCode: dataCode, packQty: dataValue })

    // this.setState({ qtyEdit: data })
    // rootdata = {
    //   "rootStoID": this.rootID,
    //   "remark": this.state.remark,
    //   "adjustItems": data,
    //   "rootStoType": this.rootType,
    // }
    // this.setState({ updateQty: rootdata })
  }
  
  dropdownAuto() {
    return <div>
      <label style={{ width: '95px', display: "inline-block", marginRight: "10px" }}>Issue Doc : </label>
      <div style={{ display: "inline-block", width: "60%"}}>
        <AutoSelect data={this.state.IssueDocdata} result={(res) => {this.genDocItem(res.value) }} />
      </div>
    </div>
  }


  // createListTable(flag) {
  //   if(flag){ //เพิ่มได้
  //     console.log(this.state.Issue)
  //     let QueryDoc = this.state.DocumentItemSto
  //     let JSONDoc = []
  //     const arrdata = []
  //     JSONDoc.push({ "f": "Document_ID", "c": "=", "v": this.state.Issue })
  //     QueryDoc.q = JSON.stringify(JSONDoc)
  //     Axios.get(createQueryString(QueryDoc)).then((res) => {
  //       res.data.datas.forEach(row => {
  //         arrdata.push({ Code: row.Code, Qty: row.Quantity, UnitTypeName: row.UnitTypeName })
  //       })
  //       this.setState({ dataTable: arrdata }, () => console.log(this.state.dataTable))
  //     })
  //   }else{
  //     //เพิ่มไม่ได้
  //   }
  // }

  render() {    
    return (
      <div>
        <Row>
          <Col sm="6">
            {this.dropdownAuto()}           
          </Col>
          <Col sm="6">
          <div className=""><label style={{width: '95px', display: "inline-block", marginRight: "10px" }}>Doc Item : </label>
                <div style={{ display: "inline-block", width: "60%", }}><AutoSelect data={this.state.IssueDocItem} result={(e) => this.setState({ "docItem": e})}  /></div>
          </div>         
          </Col>
          <Col sm="6">
          <label style={{ width: '95px', display: "inline-block",  marginRight: "10px" }}>Barcode Pallet : </label>
            <Input id="barcodetext" style={{ width: '60%', display: 'inline-block' }} type="text"
              value={this.state.barcode} placeholder="Barcode"
              onChange={e => { this.setState({ barcode: e.target.value }) }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && this.state.barcode !== "") {
                  this.checkPallet()
                }
              }} />{' '}
          </Col>
        </Row><br />
        {this.state.displayDataCard}
      </div>
    )
  }
}

export default Return;
