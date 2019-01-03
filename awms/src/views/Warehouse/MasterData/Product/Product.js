import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import { apicall, createQueryString } from '../../ComponentCore'
import { TableGen } from '../TableSetup';
import Axios from 'axios';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';

const api = new apicall()
class ListProduct extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      autocomplete: [],
      statuslist: [{
        'status': [{ 'value': '*', 'label': 'All' }, { 'value': '1', 'label': 'Active' }, { 'value': '0', 'label': 'Inactive' }],
        'header': 'Status',
        'field': 'Status',
        'mode': 'check',
      }],
      acceptstatus: false,
      select: {
        queryString: window.apipath + "/api/viw",
        t: "SKUMaster",
        q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
        f: "ID,SKUMasterType_ID,SKUMasterType_Code,UnitType_ID,UnitType_Code,Code," +
          "Name,Description,WeightKG,WidthM,LengthM,HeightM,Cost,Price,Revision,Status,Created,Modified,ObjectSize_ID,ObjectSize_Code",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
      },
      sortstatus: 0,
      selectiondata: []
    };
    this.onHandleClickLoad = this.onHandleClickLoad.bind(this);
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getAutocompletee = this.getAutocomplete.bind(this);
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    this.uneditcolumn = ["SKUMasterType_Code", "SKUMasterType_Name", "UnitType_Code", "Created", "Modified", "Revision", "ObjectSize_Code"]
  }

  onHandleClickCancel(event) {
    this.forceUpdate();
    event.preventDefault();
  }
  componentDidMount() {
    document.title = "SKU - AWMS"
  }
  async componentWillMount() {
    this.getAutocomplete();
    //permission
    let dataGetPer = await GetPermission()
    CheckWebPermission("SKU", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
  }
  //permission
  displayButtonByPermission(dataGetPer) {
    let checkview = true
    if (CheckViewCreatePermission("SKU_view", dataGetPer)) {
      checkview = true //แสดงข้อมูลเฉยๆ
    }
    if (CheckViewCreatePermission("SKU_create&modify", dataGetPer)) {
      checkview = false //แก้ไข
    }
    if (checkview === true) {
      this.setState({ permissionView: false })
    } else if (checkview === false) {
      this.setState({ permissionView: true })
    }
  }
  componentWillUnmount() {

  }

  onHandleClickLoad(event) {
    api.post(window.apipath + "/api/mst/TransferFileServer/SKUMst", {})
    this.forceUpdate();
  }

  getAutocomplete() {
    const unitselect = {
      queryString: window.apipath + "/api/mst",
      t: "UnitType",
      q: "[{ 'f': 'Status', c:'<', 'v': 2},{ 'f': 'ObjectType', c:'=', 'v': 2}]",
      f: "ID,concat(Code,' : ',Name) as Code",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      all: "",
    }

    const packselect = {
      queryString: window.apipath + "/api/mst",
      t: "SKUMasterType",
      q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
      f: "ID,concat(Code,' : ',Name) as Code",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      all: "",
    }
    const objectsizeselect = {
      queryString: window.apipath + "/api/mst",
      t: "ObjectSize",
      q: "[{ 'f': 'Status', c:'<', 'v': 2},{ 'f': 'ObjectType', c:'=', 'v': 2}]",
      f: "ID,concat(Code,' : ',Name) as Code",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      all: "",
    }

    Axios.all([api.get(createQueryString(packselect)),
    api.get(createQueryString(unitselect)),
    api.get(createQueryString(objectsizeselect))]).then(
      (Axios.spread((packresult, unitresult, objectsizeresult) => {
        let ddl = this.state.autocomplete
        let packList = {}
        let unitList = {}
        let objectsizeList = {}
        packList["data"] = packresult.data.datas
        packList["field"] = "SKUMasterType_Code"
        packList["pair"] = "SKUMasterType_ID"
        packList["mode"] = "Dropdown"

        unitList["data"] = unitresult.data.datas
        unitList["field"] = "UnitType_Code"
        unitList["pair"] = "UnitType_ID"
        unitList["mode"] = "Dropdown"

        objectsizeList["data"] = objectsizeresult.data.datas
        objectsizeList["field"] = "ObjectSize_Code"
        objectsizeList["pair"] = "ObjectSize_ID"
        objectsizeList["mode"] = "Dropdown"

        ddl = ddl.concat(packList).concat(unitList).concat(objectsizeList)
        this.setState({ autocomplete: ddl })
      })))
  }

  createBarcodeBtn(data) {
    return <Button type="button" color="info"
      onClick={() => this.history.push('/mst/sku/manage/barcode?barcodesize=4&barcode=' + data.Code + '&Name=' + data.Name)}>Print</Button>
  }

  render() {
    const view = this.state.permissionView
    const cols = [
      //{ accessor: 'SKUMasterType_Code', Header: 'SKU Type', Filter: "text", fixed: "left" },
      { accessor: 'Code', Header: 'Code', editable: view, Filter: "text", minWidth: 120 },
      { accessor: 'SKUMasterType_Code', Header: 'Catagory', updateable: view, Filter: "text", Type: "autocomplete", minWidth: 120 },
      { accessor: 'Name', Header: 'Name', editable: view, Filter: "text", minWidth: 230 },
      //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:false, },
      { accessor: 'UnitType_Code', Header: 'Base Unit', updateable: view, Filter: "text", Type: "autocomplete", minWidth: 100 },
      { accessor: 'WeightKG', Header: 'Gross Weight (Kg.)', editable: view, Filter: "text", datatype: "int", minWidth: 100, className: "right" },
      //{ accessor: 'WidthM', Header: 'Width (M)', editable: true, datatype: "int"},
      //{ accessor: 'LengthM', Header: 'Length (M)', editable: true, datatype: "int" },
      //{ accessor: 'HeightM', Header: 'Height (M)', editable: true, datatype: "int"},
      //{ accessor: 'ObjectSize_Code', Header: 'Object Size', Filter: "text", Type: "autocomplete", minWidth: 90 },
      //{ accessor: 'Cost', Header: 'Cost', editable: true, datatype: "int", Filter: "text" },
      //{ accessor: 'Price', Header: 'Price', editable: true, datatype: "int", Filter: "text" },
      //{ accessor: 'Status', Header: 'Status', editable: true, Type: "checkbox", Filter: "dropdown" },
      { accessor: 'Created', Header: 'Create', filterable: false, minWidth: 170, maxWidth: 170 },
      /* {accessor: 'CreateTime', Header: 'Create Time', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
      { accessor: 'Modified', Header: 'Modify', editable: false, filterable: false, minWidth: 170, maxWidth: 170 },
      //{accessor: 'ModifyTime', Header: 'Modify Time', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      { show: view, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove" },
    ];

    const btnfunc = [{
      history: this.props.history,
      btntype: "Barcode",
      func: this.createBarcodeBtn
    }]
    return (
      <div>
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

        <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist}
          filterable={true} autocomplete={this.state.autocomplete} accept={view} addExportbtn={view} exportfilebtn={view} expFilename={"SKU"}
          btn={btnfunc} uneditcolumn={this.uneditcolumn}
          table="ams_SKUMaster" />

      </div>
    )
  }
}

export default ListProduct;
