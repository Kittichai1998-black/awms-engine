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
    document.title = "Picking : AWMS";
    //permission
    this.setState({ showbutton: "none" })
    let dataGetPer = await GetPermission()
    CheckWebPermission("Picking", dataGetPer, this.props.history);
    //this.displayButtonByPermission(dataGetPer)
  }

  onHandleSetPalletCode(){
    Axios.get(window.apipath + "/api/wm/audit?palletCode=" + this.state.palletCode).then(res => {
      if(res.data._result.status == 0){
      }
      else
        this.setState({itemLists:res.data.itemLists, docID:res.data.docID, palletComponent:true,
        palletID:res.data.palletID,issuedComponent:false})
    }).catch(res => console.log(res))
  }

  onHandlePalletChange(e){
    this.setState({palletCode:e.target.value})
  }

  palletScan(){
    return <Card style={this.style}>
      <CardBody>
        <div><label>Pallet Code : </label><input id="txtBarcode" type="text" onChange={this.onHandlePalletChange} onKeyPress={e => {
          if(e.key === "Enter"){
            this.onHandleSetPalletCode();
          }
        }}/></div>
        {this.state.palletEdit ? <div><span onClick={() => {this.setState({palletComponent:true})}}>Cancel</span></div> : null}
      </CardBody>
    </Card>
  }

  palletDisplay(){
    return <Card style={this.style}>
      <CardBody>
        <div><label>Pallet Code : </label><span>{this.state.palletCode}</span></div>
        <div><span onClick={() => {this.setState({palletComponent:false, palletEdit:true})}}>Edit</span></div>
      </CardBody>
    </Card>
  }

  createAuditItem(){
    let som_style = {background:"orange", color:"black"};
    let full_style = {background:"green", color:"white"};
    let no_style = {background:"gray", color:"white"};

    return this.state.stos.map((list,index) => {
      return <Card key={index} style={full_style}>
        <CardBody>
          <div>Pack Code : {list.packCode}</div>
          <div>Batch : {list.batch}</div>
          <div>Pallet Quantity : {list.palletQty} {list.unitType}</div>
          <div>Audit : {this.createAuditEdit(list)} / {list.palletQty} {list.unitType}</div>
        </CardBody>
      </Card>
    })
  }

  createAuditEdit(list){
    return <Input style={{width:"100px", display:"inline"}} value={list.palletQty} onChange={(e) => {
      let itemLists = this.state.itemLists;
      let item = itemLists.filter(row => {
        return row.packCode === list.packCode && row.batch == list.batch
      })
      item[0].shouldPick = e.target.value
      this.forceUpdate();
    }}/>
  }

  onHandleClickAudit(){
    let pickedList = this.state.itemLists.map(x => {
      return {stoID:x.stoID,
        docItemID:x.docItemID,
        packCode:x.packCode,
        qty:x.qty,
        baseQty:x.baseQty,
        unitID:x.unitID,
        unitCode:x.unitCode,
        baseUnitID:x.baseUnitID,
        baseUnitCode:x.baseUnitCode}
    });
    
    const data = {palletCode:this.state.palletCode,
      palletID:this.state.palletID,
      docID:this.state.issuedSelect.docID,
      pickMode:this.state.pickMode,
      pickedList:pickedList
    }

    Axios.post(window.apipath + "/api/picking", data).then((res) => {
      let mm = pickedList.every(x => {
        return x.picked === (x.canPick > x.palletQty ? x.palletQty : x.canPick)
      })
      if(!mm){
        this.onHandleClickSelectDocument(this.state.docID);
      }
      else{
        this.setState({issuedSelect:{},
          palletComponent:false,
          issuedComponent:false,
          palletEdit:false,
          toggle:false,
          pickItemList:[],
          palletCode:"",})
      }

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
              {<Button onClick={() => {this.onHandleClickAudit()}}>Picking</Button>}
            </CardBody>
          </Card> : null}
        </Row>
      </div>
    )
  }
}

export default Audit;
