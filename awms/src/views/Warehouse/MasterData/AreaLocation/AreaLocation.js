import React, { Component } from 'react';
import "react-table/react-table.css";
import { Button, Row, Col } from 'reactstrap';
import { TableGen } from '../TableSetup';
import Axios from 'axios';
import { apicall, AutoSelect, createQueryString } from '../../ComponentCore'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';
const api = new apicall()

class AreaLocation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
      autocomplete: [],
      cols1: [
        { Header: 'No.', fixed: "left", Type: 'numrows', filterable: false, className: 'center', minWidth: 45, maxWidth: 45 },
        //{Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center"},
        //{ accessor: 'Code', Header: 'Code', editable: false, Filter: "text" },
        { accessor: 'Name', Header: 'Name', editable: true, Filter: "text", minWidth: 150 },
        //{accessor: 'Description', Header: 'Description', sortable:false, editable:true, Filter:"text"},
        { accessor: 'Bank', Header: 'Bank', editable: true, Filter: "text", Type: "autolocationcode", },
        { accessor: 'Bay', Header: 'Bay', editable: true, Filter: "text", Type: "autolocationcode" },
        { accessor: 'Level', Header: 'Level', editable: true, Filter: "text", Type: "autolocationcode" },
        { accessor: 'ObjectSize_Code', Header: 'Location Type', updateable: true, Filter: "text", Type: "autocomplete" },
        { accessor: 'UnitType_Code', Header: 'Unit', updateable: true, Filter: "text", Type: "autocomplete" },
        //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},
        { accessor: 'LastUpdate', Header: 'Last Update', filterable: false, minWidth: 180, maxWidth: 180 },
        // { accessor: 'Created', Header: 'Create', editable: false, filterable: false },
        /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
        // { accessor: 'Modified', Header: 'Modify', editable: false, filterable: false },
        //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
        //{Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Barcode", btntext:"Barcode"},
        { Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove" },
      ],
      cols2: [],
      statuslist: [{
        'status': [{ 'value': '*', 'label': 'All' }, { 'value': '1', 'label': 'Active' }, { 'value': '0', 'label': 'Inactive' }],
        'header': 'Status',
        'field': 'Status',
        'mode': 'check',
      }],
      acceptstatus: false,
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
      supplier: {
        queryString: window.apipath + "/api/mst",
        t: "Supplier",
        q: "[{ 'f': 'Status', c:'=', 'v': 1}]",
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: "",
        l: "",
        all: "",
      },
      area: {
        queryString: window.apipath + "/api/viw",
        t: "AreaMaster",
        q: '',
        f: "ID,Code,Name,Description,Warehouse_ID,AreaMasterType_ID,GroupType",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: "",
        l: "",
        all: "",
      },
      sortstatus: 0,
      selectiondata: [],
      warehousedata: [],
      supplierdata: [],
      areadata: [],
      warehouseres: [],
      areadata: [],
    };
    this.getdataselect = this.getdataselect.bind(this)
    this.getSelectionData = this.getSelectionData.bind(this)
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this)
    this.setColumns = this.setColumns.bind(this)
    this.filterList = this.filterList.bind(this)
    this.dropdownAuto = this.dropdownAuto.bind(this)
    this.autoSelectData = this.autoSelectData.bind(this)
    this.createBarcodeBtn = this.createBarcodeBtn.bind(this)
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    this.uneditcolumn = ["AreaMaster_Code", "AreaMaster_Name", "AreaMaster_Description", "ObjectSize_Code", "UnitType_Code", "Modified", "Created", "LastUpdate"]

  }
  onHandleClickCancel(event) {
    this.forceUpdate();
    event.preventDefault();
  }

  async componentWillMount() {
    this.filterList();
    //permission
    let dataGetPer = await GetPermission()
    CheckWebPermission("Area Location", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
  }
  //permission
  displayButtonByPermission(dataGetPer) {
    let checkview = true
    if (CheckViewCreatePermission("Location_view", dataGetPer)) {
      checkview = true //แสดงข้อมูลเฉยๆ
    }
    if (CheckViewCreatePermission("Location_create&modify", dataGetPer)) {
      checkview = false //แก้ไข
    }
    if (checkview === true) {
      this.setState({ permissionView: false })
    } else if (checkview === false) {
      this.setState({ permissionView: true })
    }
  }
  componentWillUnmount() {
    Axios.isCancel(true);
  }

  componentDidMount() {
    document.title = "Area Location - AWMS"
    Axios.all([api.get(createQueryString(this.state.supplier)),
    api.get(createQueryString(this.state.warehouse))]).then(
      (Axios.spread((supplierresult, warehouseresult) => {
        this.setState({
          supplierdata: supplierresult.data.datas,
          warehousedata: warehouseresult.data.datas,
        }, () => {
          const supplierdata = []
          this.state.supplierdata.forEach(row => {
            supplierdata.push({ value: row.ID, label: row.Code + ' : ' + row.Name })
          })
          const warehousedata = []
          this.state.warehousedata.forEach(row => {
            warehousedata.push({ value: row.ID, label: row.Code + ' : ' + row.Name })
          })
          this.setState({ supplierdata, warehousedata })
        })
      }
      )))
  }

  componentWillUpdate(nextProps, nextState) {
    /* console.log(nextProps)
    console.log(nextState) */
  }

  autoSelectData(field, resdata, resfield) {
    this.setState({ [resfield]: resdata.value }, () => {
      if (field === "Warehouse") {
        const area = this.state.area
        let areawhere = [{ "f": "Status", "c": "=", "v": 1 }]
        if (this.state.warehouseres !== undefined) {
          areawhere.push({ 'f': 'warehouse_ID', 'c': '=', 'v': this.state.warehouseres })
        }
        area.q = JSON.stringify(areawhere)

        api.get(createQueryString(this.state.area)).then((res) => {
          const areadata = []
          res.data.datas.forEach(row => {
            areadata.push({ value: row.ID, label: row.Code + ' : ' + row.Name, grouptype: row.GroupType })
          })
          this.setState({ areadata })
        })
      } else {
        this.setState({ areamaster: resdata.value }, () => {

          this.setState({ cols1: this.setColumns() }, () =>
            this.setState({ data: this.getdataselect() }))
        })
        this.setState({ grouptype: resdata.grouptype })
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

  filterList() {
    const objselect = {
      queryString: window.apipath + "/api/mst",
      t: "ObjectSize",
      q: "[{ 'f': 'Status', c:'<', 'v': 2},{ 'f': 'ObjectType', c:'=', 'v': 0}",
      f: "ID,concat(Code,' : ',Name) as Code",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      all: "",
    }

    const areatypeselect = {
      queryString: window.apipath + "/api/mst",
      t: "AreaMaster",
      q: "[{ 'f': 'Status', c:'<', 'v': 2}",
      f: "ID,Code",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      all: "",
    }
    const unitselect = {
      queryString: window.apipath + "/api/mst",
      t: "UnitType",
      q: "[{ 'f': 'Status', c:'<', 'v': 2},{ 'f': 'ObjectType', c:'=', 'v': 0}]",
      f: "ID,concat(Code,' : ',Name) as Code",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      all: "",
    }
    Axios.all([api.get(createQueryString(objselect)), api.get(createQueryString(areatypeselect)), api.get(createQueryString(unitselect))]).then(
      (Axios.spread((objresult, areatyperesult, unitresult) => {
        let ddl = [...this.state.autocomplete]
        let objList = {}
        let areatypelist = {}
        let unitList = {}
        objList["data"] = objresult.data.datas
        objList["field"] = "ObjectSize_Code"
        objList["pair"] = "ObjectSize_ID"
        objList["mode"] = "Dropdown"

        areatypelist["data"] = areatyperesult.data.datas
        areatypelist["field"] = "AreaMaster_Code"
        areatypelist["pair"] = "AreaMaster_ID"
        areatypelist["mode"] = "Dropdown"

        unitList["data"] = unitresult.data.datas
        unitList["field"] = "UnitType_Code"
        unitList["pair"] = "UnitType_ID"
        unitList["mode"] = "Dropdown"
        ddl = ddl.concat(objList).concat(areatypelist).concat(unitList)
        this.setState({ autocomplete: ddl })
      })))
  }

  getSelectionData(data) {
    let obj = []
    data.forEach((datarow, index) => {
      obj.push({ "barcode": datarow.Code, "Name": datarow.Name });
    })
    const xx = JSON.stringify(obj)
    this.setState({ barcodeObj: xx })
  }

  createBarcodeBtn(rowdata) {
    return <Button type="button" color="info" style={{ width: '80px' }}
      onClick={() => {
        let barcode = [{ "barcode": rowdata["Code"], "Name": rowdata["Name"] }]
        let barcodestr = JSON.stringify(barcode)
        window.open('/mst/arealocation/manage/barcode?barcodesize=1&barcodetype=qr&barcode=' + barcodestr, "_blank")
      }}>Print</Button>
  }

  setColumns() {
    const view = this.state.permissionView
    if (this.state.grouptype === 1) { //STORAGE
      return [
        { Header: 'No.', fixed: "left", Type: 'numrows', filterable: false, className: 'center', minWidth: 45, maxWidth: 45 },
        //{Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center", fixed: "left"},
        { accessor: 'Code', Header: 'Code', editable: false, Filter: "text", fixed: "left" },
        { accessor: 'Name', Header: 'Name', editable: view, Filter: "text", fixed: "left", minWidth: 150 },
        { accessor: 'Bank', Header: 'Bank', editable: view, Filter: "text", Type: "autolocationcode" },
        { accessor: 'Bay', Header: 'Bay', editable: view, Filter: "text", Type: "autolocationcode" },
        { accessor: 'Level', Header: 'Level', editable: view, Filter: "text", Type: "autolocationcode" },
        { accessor: 'ObjectSize_Code', Header: 'Location Type', updateable: view, Filter: "text", Type: "autocomplete", minWidth: 175 },
        { accessor: 'UnitType_Code', Header: 'Unit', updateable: view, Filter: "text", Type: "autocomplete", minWidth: 165 },
        //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},
        { accessor: 'LastUpdate', Header: 'Last Update', filterable: false, minWidth: 180, maxWidth: 180 },
        // { accessor: 'Created', Header: 'Create', editable: false, filterable: false },
        /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
        // { accessor: 'Modified', Header: 'Modify', editable: false, filterable: false },
        //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
        //{show:this.state.permissionView,Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Barcode", btntext:"Barcode"},
        { show: view, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove" },
      ];

    } else if (this.state.grouptype === 2) { //Gate
      return [
        { Header: 'No.', fixed: "left", Type: 'numrows', filterable: false, className: 'center', minWidth: 45, maxWidth: 45 },
        //{Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center", fixed: "left"},
        { accessor: 'Code', Header: 'Code', editable: false, Filter: "text", fixed: "left" },
        { accessor: 'Name', Header: 'Name', editable: view, Filter: "text", fixed: "left", minWidth: 135 },
        { accessor: 'Gate', Header: 'Gate', editable: view, Filter: "text", Type: "autolocationcode" },
        { accessor: 'ObjectSize_Code', Header: 'Location Type', updateable: view, Filter: "text", Type: "autocomplete", minWidth: 175 },
        { accessor: 'UnitType_Code', Header: 'Unit', updateable: view, Filter: "text", Type: "autocomplete", minWidth: 165 },
        //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},
        { accessor: 'LastUpdate', Header: 'Last Update', filterable: false, minWidth: 180, maxWidth: 180 },
        //{ accessor: 'Created', Header: 'Create', editable: false, filterable: false },
        /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
        //{ accessor: 'Modified', Header: 'Modify', editable: false, filterable: false },
        //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
        //{show:this.state.permissionView,Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Barcode", btntext:"Barcode"},
        { show: view, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove" },
      ];
    } else { // STAGING
      return [
        { Header: 'No.', fixed: "left", Type: 'numrows', filterable: false, className: 'center', minWidth: 45, maxWidth: 45 },
        //{Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center", fixed: "left"},
        { accessor: 'Code', Header: 'Code', Type: "autolocationcode", editable: view, Filter: "text", fixed: "left" },
        { accessor: 'Name', Header: 'Name', editable: view, Filter: "text", fixed: "left", minWidth: 150 },
        { accessor: 'Gate', Header: 'Gate', editable: view, Filter: "text" },
        { accessor: 'Bank', Header: 'Bank', editable: view, Filter: "text" },
        { accessor: 'Bay', Header: 'Bay', editable: view, Filter: "text", datatype: "int" },
        { accessor: 'Level', Header: 'Level', editable: view, Filter: "text", datatype: "int" },
        { accessor: 'ObjectSize_Code', Header: 'Location Type', updateable: view, Filter: "text", Type: "autocomplete", minWidth: 175 },
        { accessor: 'UnitType_Code', Header: 'Unit', updateable: view, Filter: "text", Type: "autocomplete", minWidth: 165 },
        //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},
        { accessor: 'LastUpdate', Header: 'Last Update', filterable: false, minWidth: 180, maxWidth: 180 },
        // { accessor: 'Created', Header: 'Create', editable: false, filterable: false },
        /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
        // { accessor: 'Modified', Header: 'Modify', editable: false, filterable: false },
        //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
        //{show:this.state.permissionView,Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Barcode", btntext:"Barcode"},
        { show: view, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove" },
      ];
    }
  }

  getdataselect() {
    if (this.state.areamaster !== "" && this.state.areamaster !== undefined) {
      return {
        queryString: window.apipath + "/api/viw",
        t: "AreaLocationMaster",
        q: "[{ 'f': 'Status', c:'<', 'v': 2},{ 'f':'AreaMaster_ID',c:'=','v': " + this.state.areamaster + "}]",
        f: "ID,AreaMaster_ID,AreaMaster_Code,AreaMaster_Name,AreaMaster_Description,Code,Name,Description,Gate,Bank,Bay,Level,ObjectSize_ID,ObjectSize_Code,UnitType_ID,UnitType_Code,Status,Created,Modified,LastUpdate",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
      }

    } else {
      return null
    }
  }

  render() {
    const btnfunc = [{
      history: this.props.history,
      btntype: "Barcode",
      func: this.createBarcodeBtn

    }]
    const view = this.state.permissionView
    return (
      <div>
        <Row>
          <Col>
            {this.dropdownAuto(this.state.warehousedata, "Warehouse", "warehouseres", false)}
          </Col>
        </Row>
        <Row>
          <Col>
            {this.dropdownAuto(this.state.areadata, "Area Zone", "areares", true)}
          </Col>
        </Row>
        <Row><Col></Col></Row>
        {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
        addbtn = เปิดปิดปุ่ม Add
        accept = สถานะของในการสั่ง update หรือ insert
        autocomplete = data field ที่ต้องการทำ autocomplete
        filterable = เปิดปิดโหมด filter
        getselection = เก็บค่าที่เลือก
      */}
        {/* <TableGen column={this.state.cols1} data={this.state.data} dropdownfilter={this.state.statuslist} addbtn={view}
                  filterable={true} autocomplete={this.state.autocomplete} areagrouptype={this.state.grouptype}
                  btn={btnfunc} uneditcolumn={this.uneditcolumn} getselection={this.getSelectionData} defaultCondition={[{ 'f': 'Status', c:'<', 'v': 2},{ 'f':'AreaMaster_ID',c:'=','v':  this.state.areamaster}]}
                  table="ams_AreaLocationMaster" autocode="@@sql_gen_area_location_code" areamaster={this.state.areamaster} printbtn={view}/>*/}
        <TableGen column={this.state.cols1} data={this.state.data} dropdownfilter={this.state.statuslist} addExportbtn={view} expFilename={"Location"}
          filterable={true} autocomplete={this.state.autocomplete} areagrouptype={this.state.grouptype} exportfilebtn={view}
          btn={btnfunc} uneditcolumn={this.uneditcolumn} defaultCondition={[{ 'f': 'Status', c: '<', 'v': 2 }, { 'f': 'AreaMaster_ID', c: '=', 'v': this.state.areamaster }]}
          table="ams_AreaLocationMaster" autocode="@@sql_gen_area_location_code" areamaster={this.state.areamaster} accept={view} />
      </div>
    )
  }
}
export default AreaLocation;
