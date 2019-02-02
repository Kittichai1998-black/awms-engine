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
import _ from "lodash";

const Axios = new apicall()


class Return extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Document: {
        queryString: window.apipath + "/api/trx",
        t: "Document",
        q: "[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002},{ 'f': 'Status', c:'=', 'v': 3}]",
        f: "ID,Code,RefID",
        g: "",
        s: "[{'f':'ID','od':'desc'}]",
        sk: "",
        l: "",
        all: "",
      },
      DocumentItemSto: {
        queryString: window.apipath + "/api/viw",
        t: "DocStoReturn",
        q: "[{ 'f': 'Status', c:'!=', 'v': 2 }]",
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'desc'}]",
        sk: "",
        l: "",
        all: "",
      },
      PalletSto: {
        queryString: window.apipath + "/api/viw",
        t: "PalletSto",
        q: "[{ 'f': 'StatusPallet', c:'=', 'v': 1}]",
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
      Area: {
        queryString: window.apipath + "/api/mst",
        t: "AreaMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "ID", "c":"in", "v": "8,9"}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        all: "",
      },
      BaseMaster: {
        queryString: window.apipath + "/api/mst",
        t: "BaseMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "ID,Code,UnitType_ID",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        all: "",
      },
      StorageObject: {
        queryString: window.apipath + "/api/trx",
        t: "StorageObject",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        all: "",
      },
      qtyEdit: [],
      dataTable: [],
      IssueDocItem: [],
      docItem: "",
      dataDoc: [],
      dataDocItem: [],
      barcode: "",
      dataFilter: [],
      areaCode: [],
      IssueDocdata: [],
      AreaData: [],
      UnitType: [],
      unittypeCode: [],
      dataSKUinPallet: [],
      Base: [],
      check: "",
      DocItemSto: [],
      show: "none",
      DocItemReturn: [],
      DocItemID: ""

    }


    this.genDocItem = this.genDocItem.bind(this)
    this.createDataCard = this.createDataCard.bind(this)
    this.mappingPallet = this.mappingPallet.bind(this)
    this.checkBase = this.checkBase.bind(this)
    this.genDocItemSto = this.genDocItemSto.bind(this)
    this.Clear = this.Clear.bind(this)
    this.genDataSto = this.genDataSto.bind(this)

  }

  async componentWillMount() {
    document.title = "Return Issue : AWMS";
    let dataGetPer = await GetPermission()
    CheckWebPermission("Return", dataGetPer, this.props.history);
    Axios.get(createQueryString(this.state.Document)).then((response) => {
      const IssueDocdata = []
      const IssueDocRefdata = []
      response.data.datas.forEach(row => {
        IssueDocdata.push({ value: row.ID, label: row.Code })
        IssueDocRefdata.push({ ID: row.ID, refID: row.RefID })
      })
      this.setState({ IssueDocdata, IssueDocRefdata })
    })

    Axios.get(createQueryString(this.state.Area)).then((response) => {
      const AreaData = []
      response.data.datas.forEach(row => {
        AreaData.push({ value: row.ID, label: row.Code + " : " + row.Name })
      })
      this.setState({ AreaData })
    })

  }

  checkBase() {
    let QueryDoc = this.state.BaseMaster
    let JSONDoc = []
    JSONDoc.push({ "f": "Code", "c": "=", "v": this.state.barcode })
    QueryDoc.q = JSON.stringify(JSONDoc)
    Axios.get(createQueryString(QueryDoc)).then((response) => {

      if (response.data.datas.length !== 0) {
        const Base = []
        response.data.datas.forEach(row => {
          //==== มี pallet ====
          console.log(row)
          Base.push({ value: row.ID, UnitType_ID: row.UnitType_ID })
        })
        this.setState({ Base })
        this.mappingPallet(true)
      } else {
        alert("Don't have pallet : " + this.state.barcode + " in system")
      }
    })
  }

  genDocItemSto(data) {
    // console.log(data) 
    this.state.IssueDocRefdata.forEach((row) => {
      if (row.ID === data) {
        this.setState({ RefID: row.refID })
      }
    })
    this.setState({ DocID: data })
    let QueryDoc = this.state.DocumentItemSto
    let JSONDoc = []
    JSONDoc.push({ "f": "ID", "c": "=", "v": data })
    QueryDoc.q = JSON.stringify(JSONDoc)
    Axios.get(createQueryString(QueryDoc)).then((response) => {
      console.log(response)
      const DocItemSto = []
      if (response.data.datas.length !== 0) {
        response.data.datas.forEach(x => {
          console.log(x)
          this.setState({ DocItemID: x.DocItem })
          this.setState({ BaseQtyRetuen: x.BaseQty })
          DocItemSto.push({ value: x.DocItem, label: x.SKUCode, lot: x.Lot, batch: x.Batch, orderNo: x.OrderNo, Code: x.SKUCode })
        })
      } else {
        DocItemSto.push({ value: null, label: null })
      }
      this.setState({ DocItemSto })
      // this.genDataSto(DocItemSto)

    })
  }

  genDataSto(DocItemSto) {

    DocItemSto.forEach(x => {

      let QueryDoc = this.state.StorageObject
      let JSONDoc = []
      JSONDoc.push({ "f": "ID", "c": "=", "v": x.StoObID })
      QueryDoc.q = JSON.stringify(JSONDoc)
      Axios.get(createQueryString(QueryDoc)).then((res) => {
        console.log(res)
        const DataReturn = []
        res.data.datas.forEach(row => {
          DataReturn.push({ value: row.Code, lot: row.Lot, OrderNo: row.OrderNo, Batch: row.Batch })
        })
        this.setState({ DataReturn })
      })
    })
  }

  genDocItem(data) {
    console.log(data)
    let QueryDoc = this.state.DocItem
    let JSONDoc = []
    JSONDoc.push({ "f": "ID", "c": "=", "v": data })
    QueryDoc.q = JSON.stringify(JSONDoc)
    Axios.get(createQueryString(QueryDoc)).then((response) => {
      const DocItemReturn = []
      response.data.datas.forEach(x => {
        console.log(x)
        DocItemReturn.push({ value: x.ID, Code: x.Code, Lot: x.Lot, OrderNo: x.OrderNo, Batch: x.Batch })
      })
      console.log(DocItemReturn)
      this.setState({ DocItemReturn })
    })
  }




  mappingPallet(flag) {

    console.log(flag)
    if (flag === true) {
      let postdata = {
        scanCode: this.state.barcode
        , amount: 1
        , areaID: this.state.AreaID
        , action: 1
        , mode: 0
        , options: null
        , unitCode: null
        , warehouseID: 1
        , mapsto: null
        , isRoot: true
      }
      console.log(postdata)
      Axios.post(window.apipath + "/api/wm/VRMapSTO", postdata).then((res) => {

        console.log(res)
        if (res.data._result.status === 1) {

          if (res.data.mapstos.length === 0) {
            // ==== Pallet ใหม่ ไม่เช็ค ===
            console.log(res.data.id)
            this.createDataCard(null, false, res.data.id)
          } else {
            //==== แสดงข้อมูล ====
            const dataSKUinPallet = []
            res.data.mapstos.forEach(x => {
              dataSKUinPallet.push({ id: x.parentID, sku: x.code, qty: x.qty })
            })
            console.log(dataSKUinPallet)
            this.createDataCard(dataSKUinPallet, true, null)
          }
        }
      })
    }

  }

  createDataCard(data, flag, palletID) {
    //เพิ่มได้
    let QueryDoc = this.state.DocumentItemSto
    let JSONDoc = []
    JSONDoc.push({ "f": "Status", "c": "=", "v": 1, "f": "ID", "c": "=", "v": this.state.DocID })
    QueryDoc.q = JSON.stringify(JSONDoc)
    let Doc = []
    if (flag === true) {

      data.forEach(dataPallet => {
        Axios.get(createQueryString(QueryDoc)).then((res) => {
          var dataCard = res.data.datas.map((list, index) => {
            console.log(list)
            return <Card key={index} style={{ background: 'rgb(116, 203, 147)' }}>
              <CardBody>
                <div style={{ textAlign: "center"}}><label style={{ fontWeight: "bolder", fontSize: "1.125em", borderBottom: "solid 3px rgba(255, 255, 255, 0.418)" }}>Pallet Detail</label></div>
                <div><label style={{ fontWeight: "bolder", marginTop: "5px" }}>SKU in Pallet : </label> {dataPallet.sku} &nbsp;&nbsp;<label style={{ fontWeight: "bolder" }}>Qty : </label> {dataPallet.qty}</div>
                <div style={{ textAlign: "center" }}><label style={{ textAlign: "center", fontWeight: "bolder", fontSize: "1.125em", borderBottom: "solid 3px rgba(255, 255, 255, 0.418)" }}>SKU for Return</label></div>
                <div><label style={{ fontWeight: "bolder" }}>Code : </label> {list.SKUCode}</div>
                <div><label style={{ fontWeight: "bolder" }}>Qty for Return / Qty for Doc : </label> <Input defaultValue={list.Quantity} style={{ height: "30px", width: "60px", background: "#FFFFE0", display: "inline-block" }} max="" type="number"
                  onChange={(e) => { this.ChangeData(e, e.target.value) }} /> / {this.state.BaseQtyRetuen}</div>
                <div><label style={{ fontWeight: "bolder" }}>Unit Type : </label> {list.Unit}</div><br />
                <div style={{ textAlign: "center", width: "100%" }}><Button onClick={() => { this.updateDocItemSto(dataPallet.id) }} color="primary" >Confirm</Button>&nbsp;&nbsp;
            <Button onClick={() => { this.Clear() }} color="danger" >Cancel</Button></div>
              </CardBody>
            </Card>

          })
          this.setState({ displayDataCard: dataCard })
        })
      })
    } else {
      Axios.get(createQueryString(QueryDoc)).then((res) => {
        var dataCard = res.data.datas.map((list, index) => {
          console.log(list)
          return <Card key={index} style={{ background: 'rgb(255, 207, 61)' }}>
            <CardBody>
              <div style={{ textAlign: "center" }}><label style={{ fontWeight: "bolder", fontSize: "1.125em", borderBottom: "solid 3px rgba(255, 255, 255, 0.418)" }}>Pallet Detail</label></div>
              <div><label style={{ fontWeight: "bolder", marginTop: "5px" }}>SKU in Pallet : </label> {" - "} &nbsp;&nbsp;<label style={{ fontWeight: "bolder" }}>Qty : </label> {" - "}</div>
              <div style={{ textAlign: "center" }}><label style={{ textAlign: "center", fontWeight: "bolder", fontSize: "1.125em", borderBottom: "solid 3px rgba(255, 255, 255, 0.418)" }}>SKU for Return</label></div>
              <div><label style={{ fontWeight: "bolder" }}>Code : </label> {list.SKUCode}</div>
              <div><label style={{ fontWeight: "bolder" }}>Qty for Return / Qty for Doc : </label> <Input defaultValue={list.Quantity} style={{ height: "30px", width: "60px", background: "#FFFFE0", display: "inline-block" }} max="" type="number"
                onChange={(e) => { this.ChangeData(e, e.target.value) }} /> / {list.BaseQty}</div>
              <div><label style={{ fontWeight: "bolder" }}>Unit Type : </label> {list.Unit}</div><br />
              <div style={{ textAlign: "center", width: "100%" }}><Button onClick={() => { this.updateDocItemSto(palletID) }} color="primary" >Confirm</Button>&nbsp;&nbsp;
            <Button onClick={() => { this.Clear() }} color="danger" >Cancel</Button></div>
            </CardBody>
          </Card>

        })
        this.setState({ displayDataCard: dataCard })
      })

    }
  }

  updateDocItemSto(data) {
    console.log(this.state.dataValue)
    console.log(this.state.DocID)
    console.log(this.state.dataValue)
    console.log(this.state.DocItemReturn)
    if (this.state.dataValue !== undefined) {
      console.log("xxx")
      console.log(this.state.DocItemID)
      this.state.DocItemSto.forEach(x => {
        console.log(x)
        let postdata = {
          docItemID: this.state.DocItemID
          , baseID: data
          , packCode: x.Code
          , batch: x.batch
          , lot: x.lot
          , orderNo: x.orderNo
          , baseQty: this.state.dataValue
        }
        console.log(postdata)
        console.log(window.apipath + "/api/wm/issued/sto/return")
        Axios.post(window.apipath + "/api/wm/issued/sto/return", postdata).then((res) => {
          console.log(res)
        })
        window.success("Success")
        this.Clear()
      })

    } else {
      alert("Please input Qty item return")
    }
  }


  Clear() {
    this.setState({ displayDataCard: null })
    this.setState({ barcode: "" })
  }

  ChangeData(e, dataValue) {
    e.target.style.background = "yellow"
    this.setState({ dataValue })
    console.log(dataValue)
  }

  dropdownAuto() {
    return <div>
      <label style={{ width: '100%', display: "inline-block", marginRight: "10px", fontWeight: "bold" }}>Issue Doc : </label><br />
      <div style={{ textAlign: "center", display: "inline-block", width: "100%" }}>
        <AutoSelect data={this.state.IssueDocdata} result={(res) => { this.genDocItemSto(res.value) }} />
      </div>
      <label style={{ width: '100%', display: "inline-block", marginRight: "10px", marginTop: "10px", fontWeight: "bold" }}>Sap.Doc No. : <label style={{ fontWeight: "normal" }}>{this.state.RefID === null || this.state.RefID === "" ? '-' : this.state.RefID}</label></label><br />
    </div>
  }


  render() {
    return (
      <div>

        {this.dropdownAuto()}

        <label style={{ width: '100%', display: "inline-block", marginRight: "10px", fontWeight: "bold" }}>Item Return : </label><br />
        <div style={{ textAlign: "center", display: "inline-block", width: "100%", }}><AutoSelect data={this.state.DocItemSto} result={(e) => this.genDocItem(e.value)} /></div><br />

        <label style={{ width: '100%', display: "inline-block", marginRight: "10px", fontWeight: "bold", marginTop: "6px" }}>Area : </label><br />
        <div style={{ textAlign: "center", display: "inline-block", width: "100%", }}><AutoSelect data={this.state.AreaData} result={(e) => this.setState({ "AreaID": e.value })} /></div><br />

        <label style={{ width: '100%', display: "inline-block", marginRight: "10px", fontWeight: "bold", marginTop: "6px" }}>Barcode Pallet : </label><br />
        <Input id="barcodetext" style={{ textAlign: "center", width: '100%', display: 'inline-block' }} type="text"
          value={this.state.barcode} placeholder="Barcode"
          onChange={e => { this.setState({ barcode: e.target.value }) }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && this.state.barcode !== "") {
              this.checkBase()
            }
          }} />{' '}<br />
        <br />
        {this.state.displayDataCard}
      </div>
    )
  }
}

export default Return;