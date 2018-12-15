import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Button, Nav, NavItem, NavLink, Row,Col, Card, CardBody } from 'reactstrap';
import ReactTable from 'react-table'
import {AutoSelect, Clone, apicall,createQueryString} from '../ComponentCore'
//import Axios from 'axios';
import {EventStatus} from '../Status'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classnames from 'classnames';
import _ from 'lodash'
import {GetPermission,Nodisplay} from '../../ComponentCore/Permission';

const Axios = new apicall()

const GITest = [{
  code:"GI-000001",
  matDoc:"MatDoc1",
  destination:"Warehouse1",
  itemList:[{
    code:'10000001',
    picked:10,
    willPick:20,
  },{
    code:'10000002',
    picked:10,
    willPick:20,
  },{
    code:'10000003',
    picked:10,
    willPick:20,
  }],

},{
  code:"GI-000002",
  matDoc:"MatDoc2",
  destination:"Warehouse2",
  itemList:[{
    code:'10000001',
    picked:10,
    willPick:20,
  },{
    code:'10000002',
    picked:10,
    willPick:20,
  },{
    code:'10000003',
    picked:10,
    willPick:20,
  }],
}];


class Picking extends Component{
  constructor(){
    super();
    this.state = {
      palletComponent:false,
      issuedComponent:false,
      toggle:false,
      pickItemList:[]
    }
    this.onHandlePalletChange = this.onHandlePalletChange.bind(this)
    this.onHandleSetPalletCode = this.onHandleSetPalletCode.bind(this)
    this.style = {width:"100%", overflow:"hidden", marginBottom: "10px", textAlign:"left"}
  }

  onHandleSetPalletCode(e){
    if(e.key === "Enter"){
      this.setState({palletComponent:true})
    }
  }

  onHandlePalletChange(e){
    this.setState({palletCode:e.target.value})
  }

  palletScan(){
    return <Card style={this.style}>
      <CardBody>
        <div><label>Pallet Code : </label><input type="text" onChange={this.onHandlePalletChange} onKeyPress={this.onHandleSetPalletCode}/></div>
        <div><span onClick={() => {this.setState({palletComponent:true})}}>Cancel</span></div>
      </CardBody>
    </Card>
  }

  palletDisplay(){
    return <Card style={this.style}>
      <CardBody>
        <div><label>Pallet Code : </label><span>{this.state.palletCode}</span></div>
        <div><span onClick={() => {this.setState({palletComponent:false})}}>Edit</span></div>
      </CardBody>
    </Card>
  }

  createIssuedList(){
    let issuedlist = GITest.map((list,index) => {
      return <Button color="danger" key={index} style={this.style} onClick={() => this.setState({issuedComponent:true, issuedSelect:list}, () => {this.onHandleClickSelectDocument()})}>
        <div>Document : {list.code}</div>
        <div>Material No : {list.matDoc}</div>
        <div>Destination : {list.destination}</div>
      </Button>
    })

    return <Card style={this.style}><CardBody>{issuedlist}</CardBody></Card>;
  }

  onHandleClickSelectDocument(){
    var pickItemList = [{
      palletCode:"1111",
      packCode:"10000001",
      pick:true,
      batch:"XYZ",
      palletQty:100,
      shouldPick:100,
      canPick:100,
      unitName:"ชิ้น"
    },{
      palletCode:"1111",
      packCode:"10000002",
      pick:true,
      batch:"XYZ",
      palletQty:100,
      shouldPick:100,
      canPick:100,
      unitName:"ชิ้น"
    },{
      palletCode:"1111",
      packCode:"10000003",
      pick:false,
      batch:"XYZ",
      palletQty:100,
      shouldPick:0,
      canPick:100,
      unitName:"ชิ้น"
    }];
    this.setState({pickItemList});
  }

  issuedSelect(){
    let styleOpen = {maxHeight:"auto", width:"100%"};
    let issued = this.state.issuedSelect;
    if(!this.state.toggle){
      return <Card style={this.style}>
        <CardBody>
        <div>Document : {issued.code}</div>
        <div>Material No : {issued.matDoc}</div>
        <div>Destination : {issued.destination}</div>
          <div><span onClick={() => {this.setState({issuedComponent:false})}}>{"Edit"}</span> <span onClick={() => {this.setState({toggle:!this.state.toggle})}}>{"See More..."}</span></div>
        </CardBody>
      </Card>
    }
    else{
      return <Card style={styleOpen}>
      <CardBody>
        <div>Document : {issued.code}</div>
        <div>Material No : {issued.matDoc}</div>
        <div>Destination : {issued.destination}</div>
        <div>Product List : </div>
          <ul>
            
            {issued.itemList.map((row, index) => {
              return <div>{row.code + "=>" + row.picked + "/" + row.willPick }</div>
            })}
          </ul>
        <div><span onClick={() => {this.setState({issuedComponent:false})}}>{"Edit"}</span> <span onClick={() => {this.setState({toggle:!this.state.toggle})}}>{"See Flew..."}</span></div>
      </CardBody>
    </Card>
    }
      
  }

  createPickItem(){
    let som_style = {background:"orange", color:"black"};
    let full_style = {background:"green", color:"white"};
    let no_style = {background:"gray", color:"white"};

    return this.state.pickItemList.map((list,index) => {
      return <Card key={index} style={
          Object.assign(list.shouldPick == list.canPick ? full_style : list.shouldPick == 0 ? no_style : som_style
            , this.style)}>
        <CardBody>
          <div>Pack Code : {list.packCode}</div>
          <div>Batch : {list.batch}</div>
          <div>Quantity : {list.palletQty} {list.unitName}</div>
          <div>Pick : {list.pick ? this.createPickEdit(list) : <span>0</span>} / {list.canPick} {list.unitName}</div>
        </CardBody>
      </Card>
    })
  }

  createPickEdit(list){
    return <Input style={{width:"100px", display:"inline"}} value={list.shouldPick} onChange={(e) => {
      let pickItemList = this.state.pickItemList;
      let item = pickItemList.filter(row => {
        return row.packCode === list.packCode && row.batch == list.batch
      })
      if(e.target.value > list.canPick){
        
        console.log(e.target.value)
        console.log(list.canPick)
        console.log(e.target.value > list.canPick)
        console.log("--------------")
        alert("เกินจำนวนที่ต้องหยิบสินค้า")

      }
      else
        item[0].shouldPick = e.target.value
      this.forceUpdate();
    }}/>
  }

  render(){
    return(
      <div>
        <Row>
          {this.state.palletComponent ? this.palletDisplay() : this.palletScan()}
        </Row>
        <Row>
          {this.state.palletComponent && !this.state.issuedComponent ? this.createIssuedList() : this.state.palletComponent && this.state.issuedComponent ? this.issuedSelect() : null }
        </Row>
        <Row>
          {this.state.issuedComponent && this.state.palletComponent ? <Card style={this.style}><CardBody>{this.createPickItem()}</CardBody></Card> : null}
        </Row>
      </div>
    )
  }
}

export default Picking;
