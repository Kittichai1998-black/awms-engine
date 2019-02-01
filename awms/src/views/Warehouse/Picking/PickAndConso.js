import React, { Component } from 'react';
import "react-table/react-table.css";
import { Input, Button, Nav, NavItem, NavLink, Row, Col, Card, CardBody } from 'reactstrap';
import ReactTable from 'react-table'
import { AutoSelect, Clone, apicall, createQueryString } from '../ComponentCore';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../ComponentCore/Permission';
import { faAlignRight, faAlignCenter } from '@fortawesome/free-solid-svg-icons';
import { text } from '@fortawesome/fontawesome-svg-core';

const Axios = new apicall()

class Picking extends Component {
  constructor() {
    super();
    this.state = {
      palletComponent:false,
      issuedComponent:false,
      palletEdit:false,
      toggle:false,
      pickMode:1,
      pickItemList:[],
      palletAccept:true
    }
    this.onHandlePalletChange = this.onHandlePalletChange.bind(this)
    this.onHandleSetPalletCode = this.onHandleSetPalletCode.bind(this)
    this.style = { width: "100%", overflow: "hidden", marginBottom: "10px", textAlign: "left" }
  }
  async componentWillMount() {
    document.title = "Picking : AWMS";
    //permission
    this.setState({ showbutton: "none" })
    let dataGetPer = await GetPermission()
    CheckWebPermission("Picking", dataGetPer, this.props.history);
    //this.displayButtonByPermission(dataGetPer)
  }

  onHandleSetPalletCode(){
    this.setState({palletAccept:false})
    Axios.get(window.apipath + "/api/picking?palletCode=" + this.state.palletCode + "&pickMode=" + this.state.pickMode).then(res => {
      if (res.data._result.status == 0) {
      }
      else
        this.setState({palletCode:res.data.palletCode, docItems:res.data.docItems, stos:res.data.stos, palletComponent:true,
        palletID:res.data.palletID,issuedComponent:false, palletAccept:true})
    }).catch(res => console.log(res))
  }

  onHandlePalletChange(e) {
    this.setState({ palletCode: e.target.value })
  }

  palletScan() {
    return <Card style={this.style}>
      <CardBody>
        <label className="float-left" style={{ fontWeight: "bolder", paddingRight: "10px" }}>Pallet Code : </label>
        <input style={{ width: "200px" }} id="txtBarcode" type="text" onChange={this.onHandlePalletChange} onKeyPress={e => {
          if (e.key === "Enter") {
            this.onHandleSetPalletCode();
          }
        }} />
        {this.state.palletEdit ? <Button style={{ width: "100px" }} color="danger"
          onClick={() => { this.setState({ palletComponent: true }) }}>Cancel</Button> : null}
      </CardBody>
    </Card>
  }

  palletDisplay() {

    return <Card style={this.style}>
      <CardBody style={{ background: "#ffffff" }}>
        <div><label style={{ fontWeight: "bolder", paddingRight: "10px" }}>Pallet Code : </label><span style={{ width: '100px' }} > {this.state.palletCode}</span></div>
        <div>
          <Button style={{ width: "100px" }} color="success"
            onClick={() => { this.setState({ palletComponent: false, palletEdit: true }) }}>Edit</Button>
        </div>
      </CardBody>
    </Card>
  }

  createIssuedList() {
    let issuedlist = this.state.docItems.map((list, index) => {
      return <Button key={index} style={{ background: "rgb(116, 203, 147)", color: "#23282c", width: "100%", overflow: "hidden", marginBottom: "10px", textAlign: "left" }}
        onClick={() => this.setState({ issuedComponent: true, issuedSelect: list }, () => { this.onHandleClickSelectDocument(list.docID) })}>
        <div><label style={{fontWeight: "bolder"}}>Document : </label> {list.docCode}</div>
        <div><label style={{fontWeight: "bolder"}}>Material No : </label> {list.matDoc}</div>
        <div><label style={{fontWeight: "bolder"}}>Destination : </label> {list.destination}</div>
      </Button>
    })

    return <Card style={{ background: "#ffffff", width: "100%", overflow: "hidden", marginBottom: "10px", textAlign: "left" }}>
      <CardBody>{issuedlist}</CardBody></Card >;
  }

  onHandleClickSelectDocument(docID) {
    Axios.get(window.apipath + "/api/picking?palletCode=" + this.state.palletCode + "&docID=" + docID + "&pickMode=" + this.state.pickMode).then(res => {
      if (res.data._result.status == 0)
        alert("ไม่สามารถใช้งาน Pallet นี้ได้")
      else {
        if (res.data.stos.length === 0) {
          this.setState({
            palletComponent: false,
            issuedComponent: false,
            toggle: false,
            pickItemList: []
          })
        }
        else {
          this.setState({ palletCode: res.data.palletCode, docItems: res.data.docItems, stos: res.data.stos, palletComponent: true, palletID: res.data.palletID, docID: docID })
        }
      }
    }).catch(res => console.log(res))
  }

  issuedSelect() {
    let styleOpen = { maxHeight: "auto", width: "100%" };
    let issued = this.state.issuedSelect;
    if (!this.state.toggle) {
      return <Card style={{ background: "#ffffff", width: "100%", overflow: "hidden", marginBottom: "10px", textAlign: "left" }}>
        <CardBody>
          <div><label style={{fontWeight: "bolder"}}>Document : </label> {issued.docCode}</div>
          <div><label style={{fontWeight: "bolder"}}>Material No : </label> {issued.matDoc}</div>
          <div><label style={{fontWeight: "bolder"}}>Destination : </label> {issued.destination}</div>
          <div>
            <Button style={{ width: "100px" }} color="success"
              onClick={() => {
                this.setState({ issuedComponent: false })
                this.onHandleSetPalletCode()
              }}>{"Edit"}</Button>
            &nbsp;&nbsp;
          <Button style={{ width: "100px" }} color="info" onClick={() => { this.setState({ toggle: !this.state.toggle }) }}>{"Detail"}</Button></div>
        </CardBody>
      </Card>
    }
    else {
      return <Card style={{ background: "#ffffff", width: "100%", overflow: "hidden", marginBottom: "10px", textAlign: "left" }}>
        <CardBody>
        <div><label style={{fontWeight: "bolder"}}>Document : </label> {issued.docCode}</div>
          <div><label style={{fontWeight: "bolder"}}>Material No : </label> {issued.matDoc}</div>
          <div><label style={{fontWeight: "bolder"}}>Destination : </label> {issued.destination}</div>
          <div><label style={{fontWeight: "bolder"}}>Product List : </label> </div>
          <ul>
            {issued.pickItems.map((row, index) => {
              return <div>{row.itemCode + " => " + row.picked + "/" + row.willPick}</div>
            })}
          </ul>
          <div><Button style={{ width: "100px", marginRight: "5px" }} color="success"
            onClick={() => { this.setState({ issuedComponent: false }) }}>{"Edit"}</Button >
            <Button style={{ width: "100px" }} color="info"
              onClick={() => { this.setState({ toggle: !this.state.toggle }) }}>{"Hide"}</Button></div>
        </CardBody>
      </Card>
    }

  }

  createPickItem() {
    let som_style = { background: "#ffc107", color: "#23282c" }; //#ff8f00
    let full_style = { background: "#f9a825", color: "#23282c" }; //#ef6c00 
    let no_style = { background: "rgb(255, 207, 61)", color: "#23282c" }; //#f9a825

    return this.state.stos.map((list, index) => {
      return <Card key={index} style={
        Object.assign(list.shouldPick == (list.canPick > list.palletQty ? list.palletQty : list.canPick) ? full_style : list.shouldPick == 0 ? no_style : som_style
          , this.style)}>
        <CardBody>
          <div><label style={{fontWeight: "bolder"}}>Pack Code : </label> {list.packCode}</div>
          <div><label style={{fontWeight: "bolder"}}>Batch : </label> {list.batch}</div>
          <div><label style={{fontWeight: "bolder"}}>Pallet Quantity : </label> {list.palletQty} {list.unitType}</div>
          <div><label style={{fontWeight: "bolder"}}>Pick : </label> {list.pick ? this.createPickEdit(list) : <span>0</span>} / {list.canPick > list.palletQty ? list.palletQty : list.canPick} {list.unitType}</div>
        </CardBody>
      </Card>
    })
  }

  createPickEdit(list) {
    if (this.state.pickMode == 0)
      return <Input style={{ width: "100px", display: "inline" }} value={list.shouldPick} onChange={(e) => {
        let pickItemList = this.state.stos;
        let item = pickItemList.filter(row => {
          return row.packCode === list.packCode && row.batch == list.batch
        })
        if (e.target.value > list.canPick) {
          alert("เกินจำนวนที่ต้องหยิบสินค้า")
        }
        else
          item[0].shouldPick = e.target.value
        this.forceUpdate();
      }} />
    else
      return <span>{list.shouldPick}</span>
  }

  onHandleClickPicking() {
    const pickedItemList = this.state.stos.filter(x => x.pick);
    let pickedList = pickedItemList.map(x => {
      return {
        docItemID: x.docItemID,
        STOID: x.stoid,
        packCode: x.packCode,
        batch: x.batch,
        lot: x.lot,
        palletQty: x.palletQty,
        picked: x.shouldPick,
        canPick: x.canPick
      }
    });

    const data = {
      palletCode: this.state.palletCode,
      palletID: this.state.palletID,
      docID: this.state.issuedSelect.docID,
      pickMode: this.state.pickMode,
      pickedList: pickedList
    }

    Axios.post(window.apipath + "/api/picking", data).then((res) => {
      let mm = pickedList.every(x => {
        return x.picked === (x.canPick > x.palletQty ? x.palletQty : x.canPick)
      })
      if (!mm) {
        this.onHandleClickSelectDocument(this.state.docID);
      }
      else {
        this.setState({
          issuedSelect: {},
          palletComponent: false,
          issuedComponent: false,
          palletEdit: false,
          toggle: false,
          pickItemList: [],
          palletCode: "",
        })
      }

      this.setState({ palletCode: "" }, () => {
        let eleBarcode = document.getElementById("txtBarcode")
        eleBarcode.focus();
      });
    })
  }

  render() {
    return (
      <div>
        <Row>
          {this.state.palletComponent ? this.palletDisplay() : this.palletScan()}
        </Row>
        <Row>
          {this.state.palletComponent && !this.state.issuedComponent ? this.createIssuedList() : this.state.palletComponent && this.state.issuedComponent ? this.issuedSelect() : null}
        </Row>
        <Row>
          {this.state.issuedComponent && this.state.palletComponent ? <Card style={this.style}>
            <CardBody>
              {this.createPickItem()}
              {<Button style={{ width: "150px" }} color="primary" onClick={() => { this.onHandleClickPicking() }}>Pick Confirm</Button>}
            </CardBody>
          </Card> : null}
        </Row>
      </div>
    )
  }
}

export default Picking;
