import React, { Component } from 'react';
import "react-table/react-table.css";
import "../style.css";
import {Input, Button, ButtonGroup , Row, Col,
  Modal, ModalHeader, ModalBody, ModalFooter  } from 'reactstrap';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {AutoSelect, NumberInput} from '../../ComponentCore'

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
      control:"none",
      mapSTO:null,
      mapSTOView:null,
      Mode:0,
      radiostate:false,
      supplier:{queryString:window.apipath + "/api/mst",
      t:"Supplier",
      q:"[{ 'f': 'Status', c:'=', 'v': 1}]",
      f:"*",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:"",
      l:"",
      all:"",},
      warehouse:{queryString:window.apipath + "/api/mst",
      t:"Warehouse",
      q:"[{ 'f': 'Status', c:'=', 'v': 1}]",
      f:"*",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:"",
      l:"",
      all:"",},
      area:{queryString:window.apipath + "/api/mst",
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
    this.autoSelectData = this.autoSelectData.bind(this)
  }
  
  componentDidMount(){
    Axios.all([Axios.get(createQueryString(this.state.supplier)),
      Axios.get(createQueryString(this.state.warehouse))]).then(
      (Axios.spread((supplierresult, warehouseresult) => 
    {
      this.setState({supplierdata : supplierresult.data.datas,
        warehousedata:warehouseresult.data.datas,
      }, () => {
        const supplierdata = []
        this.state.supplierdata.forEach(row => {
          supplierdata.push({value:row.ID, label:row.Code + ' : ' + row.Name })
        })
        const warehousedata = []
        this.state.warehousedata.forEach(row => {
          warehousedata.push({value:row.ID, label:row.Code + ' : ' + row.Name })
        })
        this.setState({supplierdata,warehousedata})
      })}
    )))

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

  componentDidUpdate(nextState, prevState){
    if(this.state.warehouseres === nextState.warehouseres){
      
    }
  }

  autoSelectData(field, resdata, resfield){
    this.setState({[resfield]:resdata.value}, () => {
      if(field === "Warehouse"){
        const area = this.state.area
        let areawhere = JSON.parse(area.q)
        areawhere.push({'f':'warehouse_ID','c':'=','v':this.state.warehouseres})
        area.q = JSON.stringify(areawhere)
  
        Axios.get(createQueryString(this.state.area)).then((res) => {
        const areadata = []
          res.data.datas.forEach(row => {
            areadata.push({value:row.ID, label:row.Code + ' : ' + row.Name })
          })
          this.setState({areadata})
        })
      }
    })
  }

  dropdownAuto(data, field, fieldres){    
    return <div>
        <label style={{width:'80px',display:"inline-block", textAlign:"right", marginRight:"10px"}}>{field} : </label> 
        <div style={{display:"inline-block", width:"40%", minWidth:"200px"}}>
          <AutoSelect data={data} result={(res) => this.autoSelectData(field, res, fieldres)}/>
        </div>
      </div>
  }

  dropdownOption(obj){
    obj.map((data,index) => {
      return <option key={index} value={data.key}>{data.value}</option>
    })
  }

  addtolist = (data) => {
    const condata = [...data]
    const focus = {color:'red', marginLeft:"-20px", fontSize:"13px"}
    const focusf = {color:'green', marginLeft:"-20px", fontSize:"13px"}
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
  
  createListTable(){
    let status = true;
    if(this.state.Mode === 0){
      if(this.state.barcode === "" || this.state.qty === 0 || this.state.supplierres === "" || this.state.areares === ""
      || this.state.warehouseres === ""){
        status = false;
      }
    }
    else{
      if(this.state.barcode === "" || this.state.qty === 0 || this.state.warehouseres || this.state.areares){
        status = false;
      }
    }
    if(status){
      let data = {"scanCode":this.state.barcode,"amount":this.state.qty,"action":this.state.rSelect,
      "mode":this.state.Mode,"options":[{key: "supplier_id", value: this.state.supplierres}],
      "areaID":this.state.areares,"warehouseID":this.state.warehouseres,"mapsto":this.state.mapSTO};
      Axios.post(window.apipath + "/api/wm/VRMapSTO",data).then(res => {
        let header = []
        if(res.data._result.status !== 0)
        {
          this.setState({poststatus:true,control:"block",rSelect:'1',barcode:"", qty:1, response:"",})
          this.setState({mapSTO:res.data, mapSTOView:res.data}, () => {
            const clonemapsto = clone(this.state.mapSTOView)
            header = clonemapsto
            header.mapstos = this.sumChild(clonemapsto.mapstos)
          })
          return [header]
        }
        else{
          this.setState({response:<span class="text-center" color="danger">{res.data._result.message}</span>})
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
      "mode":this.state.Mode,"options":[{key: "supplier_id", value: this.state.supplierres}],
      "areaID":this.state.areares,"warehouseID":this.state.warehouseres,"mapsto":this.state.mapSTO};

    Axios.post(window.apipath + "/api/wm/VRMapSTO",).then((res) => {
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
      if(this.state.mapSTO){
        const approvedata = {isConfirm:flag,rootStoID:this.state.mapSTO.id,type:this.state.mapSTO.type}
        Axios.post(window.apipath + "/api/wm/VRMapSTO/confirm", approvedata).then((res) => {
          if(res.data._result.status !== 0){
            this.setState({result:null,mapSTOView:null,mapSTO:null, control:"none", response:"",})
            return null
          }else{
            console.log(res.data._result.message)
            this.setState({response:<span class="text-center">{res.data._result.message}</span>})
          }
        })
      }
    }
  }

  clearTable(){
    this.setState({result:null,mapSTOView:null, mapSTO:null, control:"none", response:""})
  }

  render(){
    const display={display:'none'}
    return(
      <div>
        {this.barcodeReaderPopup()}
        <Row>
          <Col sm="6">
            <label style={{fontWeight:"bold", fontSize:"1.1em"}}>Mode : {this.state.Mode===0?'Register':'Transfer'}</label>
          </Col>
          <Col sm="6">
            <ButtonGroup style={{margin:'0 0 10px 0', width:"100%"}}>
              <Button style={{width:"33%"}} color="primary" onClick={() => this.selectMode("0")} active={this.state.rSelect === "0"}>Select</Button>
              <Button style={{width:"33%"}} color="primary" onClick={() => this.selectMode("1")} active={this.state.rSelect === "1"}>Push</Button>
              <Button style={{width:"33%"}} color="primary" onClick={() => this.selectMode("2")} active={this.state.rSelect === "2"}>Remove</Button>
            </ButtonGroup>
          </Col>
        </Row>
        <Row>
          <Col>
              {this.dropdownAuto(this.state.warehousedata, "Warehouse", "warehouseres")}
          </Col>
        </Row>
        <Row>
          <Col>
              {this.dropdownAuto(this.state.areadata, "Area", "areares")}
          </Col>
        </Row>
        <Row style={this.state.Mode===0?null:display}>
          <Col>
              {this.dropdownAuto(this.state.supplierdata, "Supplier", "supplierres")}
          </Col>
        </Row>
        <Row>
          <Col sm="6">
          <label style={{width:'80px',display:"inline-block", textAlign:"right", marginRight:"10px"}}>Barcode : </label>
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
            <label style={{width:'80px',display:"inline-block", textAlign:"right", marginRight:"10px"}}>Quantity : </label>
            <NumberInput value={this.state.qty} onChange={value => this.setState({qty:value})} style={{width:'40%',display:'inline-block'}}/>{' '}
            <Button id="start" onClick={() => {this.setState({barcodemodal:true})}} color="danger" style={{display:'none'}}>Scan</Button>{' '}
            <Button onClick={this.createListTable} color="danger" style={{display:'inline-block'}} disabled={this.state.poststatus}>Post</Button>
          </Col>
        </Row>
        <Row>
          {this.state.response}
        </Row>
        <Row>
          {this.state.result}
        </Row>
        <Row className="text-center" style={{display:this.state.control}}>
            <Button onClick={() => this.approvemapsto(true)} style={this.state.Mode===0?null:display}>Save</Button>
            <Button onClick={() => this.approvemapsto(false)} style={this.state.Mode===0?null:display} color="danger">Cancel</Button>
            <Button onClick={this.clearTable} color="danger" >Clear</Button>
        </Row>
      </div>
    )
  }
}


export default StorageManagement;
