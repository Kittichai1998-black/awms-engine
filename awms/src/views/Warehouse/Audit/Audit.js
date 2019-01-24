import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Button, Nav, NavItem, NavLink, Row,Col, Card, CardBody } from 'reactstrap';
import ReactTable from 'react-table'
import {AutoSelect, Clone, apicall,createQueryString} from '../ComponentCore';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../ComponentCore/Permission';

const Axios = new apicall()

class Audit extends Component{
  constructor(){
    super();
    this.state = {
      palletComponent:false,
      issuedComponent:false,
      palletEdit:false,
      toggle:false,
      pickMode:1,
      pickItemList:[]
    }
    this.onHandlePalletChange = this.onHandlePalletChange.bind(this)
    this.onHandleSetPalletCode = this.onHandleSetPalletCode.bind(this)
    this.style = {width:"100%", overflow:"hidden", marginBottom: "10px", textAlign:"left"}
  }
  async componentWillMount() {
    document.title = "Audit : AWMS";
    //permission
    this.setState({ showbutton: "none" })
    let dataGetPer = await GetPermission()
    CheckWebPermission("Audit", dataGetPer, this.props.history);
    //this.displayButtonByPermission(dataGetPer)
  }

  onHandleSetPalletCode(){
    Axios.get(window.apipath + "/api/wm/audit?palletCode=" + this.state.palletCode).then(res => {
      if(res.data._result.status == 0){
      }
      else
        this.setState({itemLists:res.data.itemLists, docID:res.data.docID, palletComponent:true,
        palletID:res.data.palletID,issuedComponent:true})
    }).catch(res => console.log(res))
  }

  onHandlePalletChange(e){
    this.setState({palletCode:e.target.value})
  }

  palletScan() {
    return <Card style={this.style}>
      <CardBody>
        <label className="float-left" style={{ paddingRight: "10px" }}>Pallet Code : </label>
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
        <div><label>Pallet Code : </label><span style={{ width: '100px' }} >{this.state.palletCode}</span></div>
        <div>
          <Button style={{ width: "100px" }} color="success"
            onClick={() => { this.setState({ palletComponent: false, palletEdit: true }) }}>Edit</Button>
        </div>
      </CardBody>
    </Card>
  }

  createAuditItem(){
    let som_style = { background: "#ffc107", color: "#23282c" }; //#ff8f00
    let full_style = { background: "#f9a825", color: "#23282c" }; //#ef6c00 
    let no_style = { background: "rgb(255, 207, 61)", color: "#23282c" }; //#f9a825

    return this.state.itemLists.map((list,index) => {
      if(list.auditQty === undefined){
        list.auditQty = list.qty;
      }
      return <Card key={index} style={full_style}>
        <CardBody>
          <div>Pack Code : {list.packCode}</div>
          <div>Batch : {list.batch}</div>
          <div>Pallet Quantity : {list.qty} {list.unitCode}</div>
          <div>Audit : {this.createAuditEdit(list)} / {list.qty} {list.unitCode}</div>
        </CardBody>
      </Card>
    })
  }

  createAuditEdit(list){
    return <Input style={{width:"100px", display:"inline"}} value={list.auditQty} onChange={(e) => {
      let itemLists = this.state.itemLists;
      let item = itemLists.filter(row => {
        return row.packCode === list.packCode && row.batch == list.batch
      })
      if(e.target.value < 0){
        alert("สินค้าน้อยกว่า 0 ไม่ได้")
      }
      else{
        list.auditQty = Number(e.target.value)
      }
      try{
        if(isNaN(e.target.value)){
          item[0].auditQty = 0
          throw "กรอกเฉพาะตัวเลขเท่านั้น"
        }
      }
      catch(err){
        alert(err)
      }
      this.forceUpdate();
    }}/>
  }

  onHandleClickAudit(){
    let pickedList = this.state.itemLists.map(x => {
      let auditQty = x.auditQty - x.qty
      return {stoID:x.stoID,
        docItemID:x.docItemID,
        packCode:x.packCode,
        auditQty:auditQty,
        qty:x.qty,
        baseQty:x.baseQty,
        unitID:x.unitID,
        baseUnitID:x.baseUnitID}
    });
    
    const data = {docID:this.state.docID,
      palletCode:this.state.palletCode,
      itemLists:pickedList
    }

    Axios.post(window.apipath + "/api/wm/audit", data).then((res) => {
      this.setState({
        palletComponent:false,
        palletEdit:false,
        toggle:false,
        pickItemList:[],
        palletCode:"",})

      this.setState({palletCode:""}, () =>{
        let eleBarcode = document.getElementById("txtBarcode")
        eleBarcode.focus();
      });
    })
  }

  render(){
    return(
      <div>
        <Row>
          {this.state.palletComponent ? this.palletDisplay() : this.palletScan()}
        </Row>
        <Row>
          {this.state.issuedComponent && this.state.palletComponent ? <Card style={this.style}>
            <CardBody>
              {this.createAuditItem()}
              {<Button color="primary" style={{width: '130px'}} onClick={() => {this.onHandleClickAudit()}}>Auditing</Button>}
            </CardBody>
          </Card> : null}
        </Row>
      </div>
    )
  }
}

export default Audit;
