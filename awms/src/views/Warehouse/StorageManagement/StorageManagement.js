import React, { Component } from 'react';
import "react-table/react-table.css";
import "./style.css";
import {Input, Button, ButtonGroup , Tooltip ,
  Nav, NavItem, NavLink, Row, Col, Table,
  Modal, ModalHeader, ModalBody, ModalFooter  } from 'reactstrap';
import Axios from 'axios';
import ReactAutocomplete from 'react-autocomplete';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const createQueryString = (select) => {
  let queryS = select.queryString + (select.t === "" ? "?" : "?t=" + select.t)
  + (select.q === "" ? "" : "&q=" + select.q)
  + (select.f === "" ? "" : "&f=" + select.f)
  + (select.g === "" ? "" : "&g=" + select.g)
  + (select.s === "" ? "" : "&s=" + select.s)
  + (select.sk === "" ? "" : "&sk=" + select.sk)
  + (select.l === 0 ? "" : "&l=" + select.l)
  + (select.all === "" ? "" : "&all=" + select.all)
  return queryS
}

function clone(obj) {
  var copy;

  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
          copy[i] = clone(obj[i]);
      }
      return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
      }
      return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
}

class StorageManagement extends Component{
  constructor(props) {
    super(props);
    this.state = {
      mapSTO:null,
      mapSTOView:null,
      Mode:0,
      radiostate:false,
      supplier:{queryString:"https://localhost:44366/api/mst",
      t:"Supplier",
      q:"[{ 'f': 'Status', c:'=', 'v': 1}]",
      f:"*",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:"",
      l:"",
      all:"",},
      warehouse:{queryString:"https://localhost:44366/api/mst",
      t:"Warehouse",
      q:"[{ 'f': 'Status', c:'=', 'v': 1}]",
      f:"*",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:"",
      l:"",
      all:"",},
      area:{queryString:"https://localhost:44366/api/mst",
      t:"AreaMaster",
      q:'[{ "f": "Status", "c":"=", "v": 1}]',
      f:"*",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:"",
      l:"",
      all:"",},
      supplierdata:[],
      warehousedata:[],
      areadata:[],
      supplierres:"",
      warehouseres:"",
      areares:"",
      suppliervalue:[],
      warehousevalue:[],
      areavalue:[],
      barcode:"",
      qty:"1",
      barcodemodal:false,
      rSelect:"0",
      textindent:0,
      showtable:false,
      autocomplete:'',
      poststatus:false,
    };

    this.createListTable = this.createListTable.bind(this)
    this.addtolist = this.addtolist.bind(this)
    this.dropdownAuto = this.dropdownAuto.bind(this)
    this.toggle = this.toggle.bind(this)
    this.clickSubmit = this.clickSubmit.bind(this)
    this.approvemapsto = this.approvemapsto.bind(this)
    this.clearTable = this.clearTable.bind(this)
  }
  
  componentDidMount(){
    Axios.get(createQueryString(this.state.supplier)).then((res) => {
      this.setState({supplierdata:res.data.datas})
    })
    Axios.get(createQueryString(this.state.warehouse)).then((res) => {
      this.setState({warehousedata:res.data.datas})
    })

    const script3 = document.createElement("script");
    script3.src = "https://code.jquery.com/jquery-3.3.1.min.js";
    script3.type="text/javascript"
    document.head.appendChild(script3);
    const values = this.props.location.pathname.split('/')
    if(values[3].toLowerCase() === 'register'){
      this.setState({Mode:0})
    }
    else if(values[3].toLowerCase() === 'transfer'){
      this.setState({Mode:1})
    }
  }

  dropdownAuto(data, field){
    const style = {borderRadius: '3px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '2px 0',
    fontSize: '90%',
    position: 'fixed',
    overflow: 'auto',
    maxHeight: '50%', // TODO: don't cheat, let it flow to the bottom
    zIndex: '998',}
    
    return <div>
      <label style={{width:'80px'}}>{field}</label>
      <ReactAutocomplete
      menuStyle={style}
      shouldItemRender={(item, value) => item.Name.toLowerCase().indexOf(value.toLowerCase()) > -1}
      getItemValue={(item) => {
        {
          field === "Warehouse" ? this.setState({warehousevalue:{'key':item.Name,'value':item.ID}},() => {
            const area = this.state.area
            let areawhere = JSON.parse(area.q)
            areawhere.push({'f':'warehouse_ID','c':'=','v':item.ID})
            area.q = JSON.stringify(areawhere)
            console.log(createQueryString(area))
            Axios.get(createQueryString(area)).then((res) => {
              this.setState({areadata:res.data.datas})
            })
          }) : 
          field === "Supplier" ? this.setState({suppliervalue:[{'key':item.Name,'value':item.ID}]}) : 
          this.setState({areavalue:{'key':item.Name,'value':item.ID}})
        }
        return item.Name
      }}
      items={data}
      renderItem={(item, isHighlighted) =>
        <div key={item.id} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
          {item.Name}
        </div>
      }
      value={field === "Warehouse" ? this.state.warehouseres : field === "Supplier" ? this.state.supplierres : this.state.areares }
      onChange={(e) => {
        field === "Warehouse" ? this.setState({warehouseres:e.target.value, ddlwarehouse:true}) : 
        field === "Supplier" ? this.setState({supplierres:e.target.value, ddlsupplier:true}) : 
        this.setState({areares:e.target.value, ddlarea:true})
      }}
      onSelect={value => {
        field === "Warehouse" ? this.setState({warehouseres:value, ddlwarehouse:true}) : 
        field === "Supplier" ? this.setState({supplierres:value, ddlsupplier:true}) : 
        this.setState({areares:value, ddlarea:true})
      }}/>
      <span>{field === "Warehouse" && this.state.ddlwarehouse===true?"": 
        field === "Supplier" && this.state.ddlsupplier===true?"": field === "Area" && this.state.ddlarea===true?"":" *"}</span>
    </div>
  }

  dropdownOption(obj){
    obj.map((data,index) => {
      return <option key={index} value={data.key}>{data.value}</option>
    })
  }

  addtolist = (data) => {
    console.log(data)
    const condata = [...data]
    const focus = {color:'red'}
    const focusf = {color:'green'}
    return condata.map((child,i) => {
      let disQtys;
      if(child.objectSizeMaps.length > 0){
        disQtys = child.objectSizeMaps.map((v)=>{
          return <div><FontAwesomeIcon icon="puzzle-piece"/>{v.innerObjectSizeName + ' ' + v.quantity + (v.minQuantity?' : Min ' + v.minQuantity:'') + (v.maxQuantity?" : Max "+v.maxQuantity:'')}</div>
        });
      }
      else{
        disQtys = <div><FontAwesomeIcon icon="puzzle-piece"/>{child.allqty}</div>
      }
      
      return <ul key={i} style={child.isFocus===true?focus:focusf}>
        <span>{child.eventStatus === 10 ? <FontAwesomeIcon icon="pause"/> : <FontAwesomeIcon icon="box"/>} | </span>
        <span><FontAwesomeIcon icon="pallet"/>{child.code} : {child.name} | </span>
        <span><FontAwesomeIcon icon="layer-group"/>{child.objectSizeName} | </span>
        <span><FontAwesomeIcon icon="weight-hanging"/>{child.minWeiKG?child.minWeiKG+ '/':''} {child.weiKG} {child.maxWeiKG?child.maxWeiKG+ '/' : ''} {child.allqty !== undefined ? child.allqty : null}</span>
        <br/><span style={{color:'gray'}}> {disQtys}</span>

        {(child.mapstos.map(child2 => {
          let z = this.addtolist([child2])
          return z}))
        }
        </ul>
    })
  }

  sumChild(data){
    let getdata = []
    data.forEach(row1 => {
      let xx = getdata.filter(row => row.code == row1.code)
      if(xx.length > 0){
        let qty = xx[0].allqty
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

  checklimitqty(){

  }

  createListTable(){
    this.setState({poststatus:true})
    let status = true;
    if(this.state.Mode === 0){
      if(this.state.barcode === "" || this.state.qty === 0 || this.state.suppliervalue.length === 0 || this.state.areavalue.length === 0
      || this.state.warehousevalue.length === 0){
        status = false;
      }
    }
    else{
      if(this.state.barcode === "" || this.state.qty === 0 || this.state.warehousevalue.length === 0 || this.state.areavalue.length === 0){
        status = false;
      }
    }
    if(status){
      this.setState({rSelect:'1'})
      let data = {"scanCode":this.state.barcode,"amount":this.state.qty,"action":this.state.rSelect,
      "mode":this.state.Mode,"options":this.state.suppliervalue,
      "areaID":this.state.areavalue.value.toString(),"warehouseID":this.state.warehousevalue.value.toString(),"mapsto":this.state.mapSTO};
      Axios.post("https://localhost:44366/api/wm/VRMapSTO",data).then(res => {
        let header = []
        if(res.data._result.status !== 0)
        {
          this.setState({mapSTO:res.data, mapSTOView:res.data}, () => {
            const clonemapsto = clone(this.state.mapSTOView)
            console.log(clonemapsto)
            header = clonemapsto
            header.mapstos = this.sumChild(clonemapsto.mapstos)
          })
          return [header]
        }
        else{
          alert(res.data._result.message)
          if([this.state.mapSTOView].length > 0)
          {
            const clonemapsto = clone(this.state.mapSTOView)
            if([clonemapsto].length > 0 && clonemapsto !== null){
              header = clonemapsto
              header.mapstos = this.sumChild(clonemapsto.mapstos)
              return [header]
            }
            else{
              return null
            }
          }
          else{
            return null
          }
        }
      }).then(res =>  res!==null?this.addtolist(res):null).then(res => {this.setState({result:res,poststatus:false})})
    }
    else{
      alert("กรอกข้อมูลไม่ครบ")
    }
  }

  toggle() {
    this.setState({
      barcodemodal: !this.state.barcodemodal
    });
    let off = window.buttonOff;
    off();
    this.setState({barcode:window.barcoderesult})
  }

  selectMode(mode){
    this.setState({rSelect:mode})
  }

   componentWillUpdate(prevState,nextState){
     if(nextState.barcodemodal === true)
     {
      const script = document.createElement("script");
      script.src = "http://localhost/zxing.js";
      script.type="text/javascript"
      script.async = true;
      document.body.appendChild(script);
      const script2 = document.createElement("script");
      script2.src = "http://localhost/video.js";
      script2.type="text/javascript"
      document.body.appendChild(script2);
      script2.onload = (function(){ 
        window.startVDO()
        
      }).bind(this);
     }
   }

  barcodeReaderPopup(){
    return  <Modal isOpen={this.state.barcodemodal}  className={this.props.className}>
              <ModalHeader toggle={this.toggle}>Modal title</ModalHeader>
              <ModalBody>
                <div>Barcode result: <label id="dbr"/></div>
                <div className="select" style={{display:'none'}}>
                  <label htmlFor="videoSource">Video source: </label><select id="videoSource"></select>
                </div>
                <video muted width="360" height="300" autoPlay id="video"></video>
                <canvas id="pcCanvas" style={{width:"400", height:"400",display: 'none'}}></canvas>
                <canvas id="mobileCanvas" style={{width:"400", height:"400",display: 'none'}}></canvas>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" id="go">Read Barcode</Button>{' '}
                <Button color="secondary" id="off" onClick={this.toggle}>Cancel</Button>
              </ModalFooter>
            </Modal>
  }

  clickSubmit(){
    const data = {"scanCode":this.state.barcode,"amount":this.state.qty,"action":this.state.rSelect,
      "mode":this.state.Mode,"options":this.state.suppliervalue,
      "areaID":this.state.areavalue.value.toString(),"warehouseID":this.state.warehousevalue.value.toString(),"mapsto":this.state.mapSTO};

    Axios.post("https://localhost:44366/api/wm/VRMapSTO",).then((res) => {
      this.setState({warehousedata:res.data.datas})
    }).then(() => this.createListTable())
  }

  approvemapsto(flag){
    let conf
    if(flag === true){
      conf = window.confirm("ต้องการบันทึกข้อมูลหรือไม่")
    }
    else{
      conf = window.confirm("ต้องการลบหรือไม่")
    }
    if(conf === true){
      const approvedata = {isConfirm:flag,rootStoID:this.state.mapSTO.id,type:this.state.mapSTO.type}
      Axios.post("https://localhost:44366/api/wm/VRMapSTO/confirm", approvedata).then((res) => {
        if(res.data._result.status === 0){
          alert(res.data._result.status)
          this.setState({result:null,mapSTOView:null})
          return null
        }
        else{
          let header = []
          this.setState({mapSTO:res.data, mapSTOView:res.data}, () => {
            const clonemapsto = clone(this.state.mapSTOView)
            console.log(clonemapsto)
            header = clonemapsto
            header.mapstos = this.sumChild(clonemapsto.mapstos)
          })
          return [header]
        }
      }).then(res =>  res!==null?this.addtolist(res):null).then(res => {this.setState({result:res})})
    }
  }

  clearTable(){
    this.setState({result:null,mapSTOView:null})
  }

  render(){
    const display={display:'none'}
    return(
      <div>
        {this.barcodeReaderPopup()}
        <Row>
          <Col sm="6">
            <label>Mode : {this.state.Mode===0?'Register':'Transfer'}</label>
          </Col>
          <Col sm="6">
            <ButtonGroup  style={{margin:'0 0 10px 0'}}>
              <Button color="primary" onClick={() => this.selectMode("0")} active={this.state.rSelect === "0"}>Select</Button>
              <Button color="primary" onClick={() => this.selectMode("1")} active={this.state.rSelect === "1"}>Push</Button>
              <Button color="primary" onClick={() => this.selectMode("2")} active={this.state.rSelect === "2"}>Remove</Button>
            </ButtonGroup>
          </Col>
        </Row>
        <Row>
          <Col>
              {this.dropdownAuto(this.state.warehousedata, "Warehouse")}
          </Col>
        </Row>
        <Row>
          <Col>
              {this.dropdownAuto(this.state.areadata, "Area")}
          </Col>
        </Row>
        <Row style={this.state.Mode===0?null:display}>
          <Col>
              {this.dropdownAuto(this.state.supplierdata, "Supplier")}
          </Col>
        </Row>
        <Row>
          <Col sm="6">
            <label style={{width:'70px'}}>Barcode</label>
              <Input id="barcodetext" style={{width:'40%',display:'inline-block'}} type="text"
                value={this.state.barcode} placeholder="กรุณาใส่บาร์โค้ด"
                onChange={e => {this.setState({barcode:e.target.value})}}
                onKeyPress={(e) => {
                if(e.key === 'Enter' && this.state.barcode !== ""){
                  this.createListTable()
                }
              }}/>
          </Col>
          <Col sm="6">
            <label style={{width:'70px',display:'inline-block'}}>Quantity</label>
            <Input style={{width:'40%',display:'inline-block'}}
              value={this.state.qty}
              onChange={e => {this.setState({qty:e.target.qty})}}
              type="text"/>{' '}
            <Button id="start" onClick={() => {this.setState({barcodemodal:true})}} color="danger" style={{display:'none'}}>Scan</Button>{' '}
            <Button onClick={this.createListTable} color="danger" style={{display:'inline-block'}} disabled={this.state.poststatus}>Post</Button>
          </Col>
        </Row>
        <Row>
          {this.state.result}
        </Row>
        <Row>
            <Button onClick={() => this.approvemapsto(true)} style={this.state.Mode===0?null:display}>Save</Button>
            <Button onClick={() => this.approvemapsto(false)} style={this.state.Mode===0?null:display} color="danger">Cancel</Button>
            <Button onClick={this.clearTable} color="danger" >Clear</Button>
        </Row>
      </div>
    )
  }
}


export default StorageManagement;
