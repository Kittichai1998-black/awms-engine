import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Button, Nav, NavItem, NavLink, Row,Col, Card, CardBody } from 'reactstrap';
import ReactTable from 'react-table'
import {AutoSelect, Clone, apicall,createQueryString} from '../ComponentCore';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../ComponentCore/Permission';

const Axios = new apicall()

class Picking extends Component{
  constructor(){
    super();
    this.state = {
      palletComponent:false,
      issuedComponent:false,
      palletEdit:false,
      toggle:false,
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
    Axios.get(window.apipath + "/api/picking?palletCode=" + this.state.palletCode).then(res => {
      if(res.data._result.status == 0){
      }
      else
        this.setState({palletCode:res.data.palletCode, docItems:res.data.docItems, stos:res.data.stos, palletComponent:true,
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

  createIssuedList(){
    let issuedlist = this.state.docItems.map((list,index) => {
      return <Button color="danger" key={index} style={this.style} onClick={() => this.setState({issuedComponent:true, issuedSelect:list}, () => {this.onHandleClickSelectDocument(list.docID)})}>
        <div>Document : {list.docCode}</div>
        <div>Material No : {list.matDoc}</div>
        <div>Destination : {list.destination}</div>
      </Button>
    })

    return <Card style={this.style}><CardBody>{issuedlist}</CardBody></Card>;
  }

  onHandleClickSelectDocument(docID){
    Axios.get(window.apipath + "/api/picking?palletCode=" + this.state.palletCode + "&docID=" + docID).then(res => {
      if(res.data._result.status == 0)
        alert("ไม่สามารถใช้งาน Pallet นี้ได้")
      else{
        if(res.data.stos.length === 0){
          this.setState({palletComponent:false,
            issuedComponent:false,
            toggle:false,
            pickItemList:[]})
        }
        else{
          this.setState({palletCode:res.data.palletCode, docItems:res.data.docItems, stos:res.data.stos, palletComponent:true, palletID:res.data.palletID, docID:docID})
        }
      }
        }).catch(res => console.log(res))
  }

  issuedSelect(){
    let styleOpen = {maxHeight:"auto", width:"100%"};
    let issued = this.state.issuedSelect;
    if(!this.state.toggle){
      return <Card style={this.style}>
        <CardBody>
          <div>Document : {issued.docCode}</div>
          <div>Material No : {issued.matDoc}</div>
          <div>Destination : {issued.destination}</div>
          <div><span onClick={() => {
            this.setState({issuedComponent:false})
            this.onHandleSetPalletCode()
            }}>{"Edit"}</span>
          &nbsp;&nbsp;
          <span onClick={() => {this.setState({toggle:!this.state.toggle})}}>{"See More..."}</span></div>
        </CardBody>
      </Card>
    }
    else{
      return <Card style={styleOpen}>
      <CardBody>
          <div>Document : {issued.docCode}</div>
          <div>Material No : {issued.matDoc}</div>
          <div>Destination : {issued.destination}</div>
          <div>Product List : </div>
          <ul>
            {issued.pickItems.map((row, index) => {
              return <div>{row.itemCode + " => " + row.picked + "/" + row.willPick }</div>
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

    return this.state.stos.map((list,index) => {
      return <Card key={index} style={
          Object.assign(list.shouldPick == (list.canPick > list.palletQty ? list.palletQty : list.canPick) ? full_style : list.shouldPick == 0 ? no_style : som_style
            , this.style)}>
        <CardBody>
          <div>Pack Code : {list.packCode}</div>
          <div>Batch : {list.batch}</div>
          <div>Pallet Quantity : {list.palletQty} {list.unitType}</div>
          <div>Pick : {list.pick ? this.createPickEdit(list) : <span>0</span>} / {list.canPick > list.palletQty ? list.palletQty : list.canPick} {list.unitType}</div>
        </CardBody>
      </Card>
    })
  }

  createPickEdit(list){
    return <Input style={{width:"100px", display:"inline"}} value={list.shouldPick} onChange={(e) => {
      let pickItemList = this.state.stos;
      let item = pickItemList.filter(row => {
        return row.packCode === list.packCode && row.batch == list.batch
      })
      if(e.target.value > list.canPick){
        alert("เกินจำนวนที่ต้องหยิบสินค้า")
      }
      else
        item[0].shouldPick = e.target.value
      this.forceUpdate();
    }}/>
  }

  onHandleClickPicking(){
    const pickedItemList = this.state.stos.filter(x => x.pick);
    let pickedList = pickedItemList.map(x => {
      return {docItemID:x.docItemID,
        STOID:x.stoid,
        packCode:x.packCode,
        batch:x.batch,
        lot:x.lot,
        palletQty:x.palletQty,
        picked:x.shouldPick,
        canPick:x.canPick}
    });
    
    const data = {palletCode:this.state.palletCode,
      palletID:this.state.palletID,
      docID:this.state.issuedSelect.docID,
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
          {this.state.palletComponent && !this.state.issuedComponent ? this.createIssuedList() : this.state.palletComponent && this.state.issuedComponent ? this.issuedSelect() : null }
        </Row>
        <Row>
          {this.state.issuedComponent && this.state.palletComponent ? <Card style={this.style}>
            <CardBody>
              {this.createPickItem()}
              {<Button onClick={() => {this.onHandleClickPicking()}}>Picking</Button>}
            </CardBody>
          </Card> : null}
        </Row>
      </div>
    )
  }
}

export default Picking;
