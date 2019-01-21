import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import "react-table/react-table.css";
import "../style.css";
import { Redirect } from 'react-router-dom';
import {
  Input, Button, ButtonGroup, Row, Col,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
//import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AutoSelect, NumberInput, apicall, createQueryString, Clone, ToListTree } from '../../ComponentCore'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';

const Axios = new apicall()

class StorageManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      control: "none",
      mapSTO: null,
      mapSTOView: null,
      loading: false,
      Mode: 1,
      radiostate: false,
      warehouse: {
        queryString: window.apipath + "/api/mst",
        t: "Warehouse",
        q: "[{ 'f': 'Status', c:'=', 'v': 1}]",
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: "",
        l: "",
        all: "",
      },
      area: {
        queryString: window.apipath + "/api/mst",
        t: "AreaMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: "",
        l: "",
        all: "",
      },
      warehousedata: [],
      areadata: [],
      barcode: "",
      pallet: "",
      qty: "1",
      barcodemodal: false,
      rSelect: "1",
      textindent: 0,
      showtable: false,
      autocomplete: '',
      poststatus: false,
      detailPopup: false,
      display: "none"
    };

    this.createListTable = this.createListTable.bind(this)
    this.addtolist = this.addtolist.bind(this)
    this.dropdownAuto = this.dropdownAuto.bind(this)
    /* this.toggle = this.toggle.bind(this) */
    this.approvemapsto = this.approvemapsto.bind(this)
    this.clearTable = this.clearTable.bind(this)
    this.autoSelectData = this.autoSelectData.bind(this)
    /* this.togglePopup = this.togglePopup.bind(this) */
    /* this.detailBaseData = this.detailBaseData.bind(this) */
    /* this.createMarkup = this.createMarkup.bind(this) */
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
  }

  async componentWillMount() {
    //permission
    const values = this.props.location.pathname.split('/')
    if (values[3].toLowerCase() === 'revmap') {
      document.title = "Receive Mapping : AWMS";
      this.setState({ Mode: 0 })
      this.setState({ showbutton: "none" })
      let dataGetPer = await GetPermission()
      CheckWebPermission("RevMap", dataGetPer, this.props.history);
      this.displayButtonByPermission(dataGetPer)
    }
    else if (values[3].toLowerCase() === 'transfer') {
      document.title = "Transfer : AWMS";
      this.setState({ Mode: 1 })
      this.setState({ showbutton: "none" })
      let dataGetPer = await GetPermission()
      CheckWebPermission("Transfer", dataGetPer, this.props.history);
      this.displayButtonByPermission(dataGetPer)
    }
    //permission
  }
  //permission
  // 22	TransRM_view	รับเข้าสินค้า
  // 23	TransRM_create&modify	รับเข้าสินค้า
  // 24	TransTF_view	เคลื่อนย้ายสินค้า
  // 25	TransTF_create&modify	เคลื่อนย้ายสินค้า

  displayButtonByPermission(dataGetPer) {
    let check = true
    if (CheckViewCreatePermission("TransRM_view", dataGetPer) ||
      CheckViewCreatePermission("TransTF_view", dataGetPer)) {
      check = true //แสดงข้อมูล
    }
    if (CheckViewCreatePermission("TransRM_create&modify", dataGetPer) ||
      CheckViewCreatePermission("TransTF_create&modify", dataGetPer)) {
      check = false //แก้ไข
    }

    if (check === true) {
      var PerButtonPush = document.getElementById("per_button_push")
      PerButtonPush.remove()
      var PerButtonRemove = document.getElementById("per_button_remove")
      PerButtonRemove.remove()
      var PerButtonSave = document.getElementById("per_button_save")
      PerButtonSave.remove()
      var PerButtonCancel = document.getElementById("per_button_cancel")
      PerButtonCancel.remove()
      var PerButtonClear = document.getElementById("per_button_clear")
      PerButtonClear.remove()

    } else if (check === false) {
      this.setState({ showbutton: "block" })
    }
  }
  //permission

  componentDidMount() {
    
    Axios.get(createQueryString(this.state.warehouse)).then(warehouseresult => {
      const warehousedata = []
      warehouseresult.data.datas.forEach(row => {
        warehousedata.push({ value: row.ID, label: row.Code + ' : ' + row.Name, code: row.Code })
      })
      this.setState({ warehousedata })
    })

    /* const script3 = document.createElement("script");
    script3.src = "https://code.jquery.com/jquery-3.3.1.min.js";
    script3.type="text/javascript"
    document.head.appendChild(script3); */
    // const values = this.props.location.pathname.split('/')
    // if(values[3].toLowerCase() === 'register'){
    //   this.setState({Mode:0})
    // }
    // else if(values[3].toLowerCase() === 'transfer'){
    //   this.setState({Mode:1})
    // }
  }

  autoSelectData(field, resdata, resfield) {
    this.setState({ [resfield]: resdata }, () => {
      if (field === "Warehouse") {
        const area = this.state.area
        let areawhere = [{ "f": "Status", "c": "=", "v": 1 }, { "f": "Code", "c": "in", "v": "SM,FF,FR" }]
        areawhere.push({ 'f': 'warehouse_ID', 'c': '=', 'v': this.state.warehouseres.value })
        area.q = JSON.stringify(areawhere)

        Axios.get(createQueryString(area)).then((res) => {
          const areadata = []
          res.data.datas.forEach(row => {
            areadata.push({ value: row.ID, label: row.Code + ' : ' + row.Name, code: row.Code })
          })
          this.setState({ areadata })
        })
      }
    })
  }

  dropdownAuto(data, field, fieldres, child) {
    return <div>
      <label style={{ width: '80px', display: "inline-block", textAlign: "right", marginRight: "10px" }}>{field} : </label>
      <div style={{ display: "inline-block", width: "40%", minWidth: "200px" }}>
        <AutoSelect data={data} result={(res) => this.autoSelectData(field, res, fieldres)} child={child} />
      </div>
    </div>
  }

  dropdownOption(obj) {
    obj.map((data, index) => {
      return <option key={index} value={data.key}>{data.value}</option>
    })
  }

  addtolist = (data) => {
    const condata = [...data]
    const focus = { color: 'red', marginLeft: "-20px", fontSize: "13px" }
    const focusf = { color: 'green', marginLeft: "-20px", fontSize: "13px" }
    return condata.map((child, i) => {
      let disQtys;
      if (child.objectSizeMaps.length > 0) {
        let qty = 0
        for (let i = 0; i < child.objectSizeMaps.length; i++) {
          qty += child.objectSizeMaps[i].quantity
        }
        disQtys = <div>จำนวนรวม : {qty}</div>
      }
      else {
        disQtys = <div>จำนวนรวม : {child.allqty}</div>
      }

      return <ul key={i} style={child.isFocus === true ? focus : focusf} >
        <div>
          <span>{child.eventStatus === 10 ? <FontAwesomeIcon icon="pause" /> : <FontAwesomeIcon icon="check" />} | </span>
          <span><FontAwesomeIcon icon="pallet" />{child.code} : {child.name} | </span>
          <span><FontAwesomeIcon icon="layer-group" />{child.objectSizeName} | </span>
          <span>{child.minWeiKG ? child.minWeiKG + '/' : ''} {child.weiKG === 0 ? '' : child.weiKG} {child.maxWeiKG ? child.maxWeiKG + '/' : ''} Qty : {child.allqty !== undefined ? child.allqty : null}</span>
        </div>
        <span id={child.id} style={{ display: 'none' }}>{disQtys}</span>
        {(child.mapstos.map(child2 => {
          let z = this.addtolist([child2])
          return z
        }))
        }
      </ul>
    })
  }

  sumChild(data) {
    let getdata = []
    data.forEach(row1 => {
      let xx = getdata.filter(row => row.code == row1.code)
      if (xx.length > 0) {
        xx[0].allqty = xx[0].allqty + 1
        if (row1.mapstos.length > 0)
          this.sumChild(row1.mapstos)
      }
      else {
        row1.allqty = 1
        getdata.push(row1)
        row1.mapstos = this.sumChild(row1.mapstos)
      }
    })
    return getdata
  }

  createListTable() {
    let status = true;
    if (status && this.state.loading === false) {

      let itemdata = Clone(this.state.data);
      itemdata.forEach(row => {
        row.source = this.state.souwarehouseres.code;
      })
      itemdata.unshift({
        source: this.state.souwarehouseres === undefined ? null : this.state.souwarehouseres.code,
        code: this.state.palletcode,
        batch: itemdata[0] === undefined ? null : itemdata[0].batch,
        qty: 1,
        baseUnit: ""
      })

      let data = {
        "areaCode": this.state.areares.code,
        "warehouseCode": this.state.warehouseres.code,
        "data": itemdata,
        _token: localStorage.getItem("Token")
      };

      Axios.post(window.apipath + "/api/wm/asrs/sto/mapping", data).then(res => {
        console.log(res)
        this.setState({ loading: true })
        let header = []
        if (res.data._result.status !== 0) {
          this.setState({ poststatus: true, control: "block", barcode: "", qty: 1, response: "", })
          this.setState({ mapSTO: res.data, mapSTOView: res.data }, () => {

            const clonemapsto = Clone(this.state.mapSTOView)

            header = clonemapsto
            header.mapstos = this.sumChild(clonemapsto.mapstos)
            window.success("เรียบร้อย")
          })
          return [header]
        }
        else {
          this.setState({ response: <span class="text-center" color="danger">{res.data._result.message}</span>, barcode: "" })
          if ([this.state.mapSTOView].length > 0) {
            const clonemapsto = Clone(this.state.mapSTOView)
            if ([clonemapsto].length > 0 && clonemapsto !== null) {
              header = clonemapsto
              header.mapstos = this.sumChild(clonemapsto.mapstos)
              return [header]
            }
            else {
              return null
            }
          }
          else {
            return null
          }
        }
      }).then(res => {
        this.setState({ loading: false })
        return res !== null ? this.addtolist(res) : null
      }).then(res => { this.setState({ result: res, poststatus: false }) })
    }
    else {
      this.setState({ barcode: "" })
      alert("กรอกข้อมูลไม่ครบ")
    }
  }
  /* 
    toggle() {
      this.setState({
        barcodemodal: !this.state.barcodemodal
      });
      let off = window.buttonOff;
      off();
      this.setState({barcode:window.barcoderesult})
    }
  
    togglePopup() {
      this.setState({
        detailPopup: !this.state.detailPopup
      });
    } */

  selectMode(mode) {
    this.setState({ rSelect: mode })
    let barcode = document.getElementById("barcodetext")
    barcode.focus()
  }

  componentWillUpdate(prevState, nextState) {
    if (nextState.barcodemodal === true) {
      const script = document.createElement("script");
      script.src = "http://localhost/zxing.js";
      script.type = "text/javascript"
      script.async = true;
      document.body.appendChild(script);
      const script2 = document.createElement("script");
      script2.src = "http://localhost/video.js";
      script2.type = "text/javascript"
      document.body.appendChild(script2);
      script2.onload = (function () {
        window.startVDO()
      }).bind(this);
    }
  }
  /* 
    barcodeReaderPopup(){
      return  <Modal isOpen={this.state.barcodemodal}  className={this.props.className}>
                <ModalHeader toggle={this.toggle}></ModalHeader>
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
  
    createMarkup() {
      return {__html: this.state.DataPopup};
    }
  
    detailBaseData(){
      return  <Modal isOpen={this.state.detailPopup}>
                <ModalHeader toggle={this.togglePopup}>{this.state.HeaderPopup}</ModalHeader>
                <ModalBody>
                  <div dangerouslySetInnerHTML={this.createMarkup()}/>
                </ModalBody>
                <ModalFooter>
                  <Button color="secondary" id="off" onClick={this.togglePopup}>Cancel</Button>
                </ModalFooter>
              </Modal>
    } */

  approvemapsto(flag) {
    let conf
    if (flag === true) {
      conf = window.confirm("ต้องการบันทึกข้อมูลหรือไม่")
    }
    else {
      conf = window.confirm("ต้องการลบหรือไม่")
    }
    if (conf === true) {
      if (this.state.mapSTO) {
        const approvedata = { isConfirm: flag, rootStoID: this.state.mapSTO.id, type: this.state.mapSTO.type }
        Axios.post(window.apipath + "/api/wm/VRMapSTO/confirm", approvedata).then((res) => {
          if (res.data._result.status !== 0) {
            this.setState({ mapSTO: null, control: "none", response: "", })
            window.success("Complete")
            return null

          } else {
            this.setState({ response: <span class="text-center">{res.data._result.message}</span> })

          }
        })
      }
    }
    let barcode = document.getElementById("qrcode")
    barcode.focus()
  }

  barcodeManage(barcode) {
    if (barcode.substring(0, 3) === "PLL") {
      this.setState({ palletcode: barcode }, () => { this.createListTable() });
    }
    else if (barcode.length === 48) {
      const data = this.state.data;
      let qrCodeData = {
        source: this.state.souwarehouseres.code,
        code: this.state.barcode.substring(0, 18).trim(),
        batch: this.state.barcode.substring(18, 28).trim(),
        qty: this.state.barcode.substring(28, 45).trim(),
        baseUnit: this.state.barcode.substring(45, 48).trim()
      };
      data.forEach((row, index) => {
        if (row.batch === qrCodeData.batch) {
          data.splice(index, 1);
        }
      })
      data.push(qrCodeData);
      this.setState({ data: data, barcode: "", }, () => {
        if (this.state.souwarehouseres) {
          this.createListTable();
        }
      });
    }
    else if (barcode.length === 10) {
      let souWarehouse = barcode.trim();
      this.setState({ souwarehouseres: souWarehouse, barcode: "", }, () => {
        if (this.state.data.length > 0) {
          this.createListTable()
        }
      })
    }
  }

  clearTable() {
    this.setState({ result: null, mapSTOView: null, mapSTO: null, control: "none", response: "" }, () => {
      let barcode = document.getElementById("qrcode")
      barcode.focus()
    })

  }

  render() {
    const display = { display: 'none' }
    return (
      <div>
        {/* {this.detailBaseData()}
        {this.barcodeReaderPopup()} */}
        <Row>
          <Col sm="6">
            <label style={{ fontWeight: "bold", fontSize: "1.1em" }}>Mode : {this.state.Mode === 0 ? 'Register' : 'Transfer'}</label>
          </Col>
          <Col sm="6" >
          </Col>
        </Row>
        <Row>
          <Col sm="6" >
            {this.dropdownAuto(this.state.warehousedata, "Warehouse", "warehouseres", false)}
          </Col>
          <Col sm="6" >
            {this.dropdownAuto(this.state.areadata, "Area", "areares", true)}
          </Col>
        </Row>
        <Row>
          <Col>
            {/* <label style={{width:'80px',display:"inline-block", textAlign:"right", marginRight:"10px"}}>Quantity : </label>
            <NumberInput value={this.state.qty} onChange={value => this.setState({qty:value})} style={{width:'40%',display:'inline-block'}}/>{' '}
            <Button id="start" onClick={() => {this.setState({barcodemodal:true})}} color="danger" style={{display:'none'}}>Scan</Button>{' '} */}
          </Col>
        </Row>
        <Row>
          <Col>
            <label style={{ width: '90px', display: "inline-block", textAlign: "right", marginRight: "10px" }}>Barcode Scan : </label>
            <Input id="qrcode" style={{ width: '40%', display: 'inline-block' }} type="text"
              value={this.state.barcode} placeholder="กรุณาใส่บาร์โค้ดสินค้า"
              onChange={e => { this.setState({ barcode: e.target.value }) }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  this.barcodeManage(e.target.value)
                }
              }} />
            <Button onClick={this.createListTable} color="danger" style={{ display: 'inline-block' }} disabled={this.state.poststatus}>Post</Button>
          </Col>
        </Row>
        <Row>
          {this.state.response}
        </Row>
        <Row>
          {this.state.result}
        </Row>
        <Row className="text-center" style={{ display: this.state.control }}>
          <Button onClick={() => this.approvemapsto(true)} style={this.state.Mode === 0 ? null : display} id="per_button_save" color="primary">Save</Button>
          <Button onClick={() => this.approvemapsto(false)} style={this.state.Mode === 0 ? null : display} id="per_button_cancel" color="danger">Cancel</Button>
          <Button onClick={this.clearTable} color="warning" id="per_button_clear" >Clear</Button>
        </Row>
      </div>
    )
  }
}


export default StorageManagement;
