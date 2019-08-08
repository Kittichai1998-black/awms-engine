import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import { apicall, createQueryString } from '../../ComponentCore'
import { TableGen } from '../TableSetup';
import Axios from 'axios';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';

const api = new apicall()

class SKUMasterType extends Component {
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
        t: "SKUMasterType",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID,Code,Name,Description,ObjectSize_ID,ObjectSize_Code,Status,Created,Modified,LastUpdate",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
      },
      sortstatus: 0,
      selectiondata: [],
    };
    this.onHandleClickLoad = this.onHandleClickLoad.bind(this);
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getAutocompletee = this.getAutocomplete.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this);
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    this.uneditcolumn = ["ObjectSize_Code", "Modified", "Created", "LastUpdate"]
  }
  onHandleClickCancel(event) {
    this.forceUpdate();
    event.preventDefault();
  }
   
  async componentWillMount() {
    //permission
    let dataGetPer = await GetPermission()
    CheckWebPermission("Category", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
    document.title = "SKU Collection - AWMS"
    this.getAutocomplete();

  }
  //permission
  displayButtonByPermission(dataGetPer) {
    let checkview = true

    if (CheckViewCreatePermission("SKUtype_view", dataGetPer)) {
      checkview = true //แสดงข้อมูลเฉยๆ
    }
    if (CheckViewCreatePermission("SKUtype_create&modify", dataGetPer)) {
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
    api.post(window.apipath + "/api/mst/TransferFileServer/SKUMstType", {})
    this.forceUpdate();
  }

  getAutocomplete() {
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

    const packselect = {
      queryString: window.apipath + "/api/mst",
      t: "SKUMasterType",
      q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
      f: "ID,Code",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      all: "",
    }

    Axios.all([api.get(createQueryString(packselect)),
    api.get(createQueryString(objectsizeselect))]).then(
      (Axios.spread((packresult, objectsizeresult) => {
        let ddl = this.state.autocomplete
        let packList = {}
        let objectsizeList = {}
        packList["data"] = packresult.data.datas
        packList["field"] = "SKUMasterType_Code"
        packList["pair"] = "SKUMasterType_ID"
        packList["mode"] = "Dropdown"

        objectsizeList["data"] = objectsizeresult.data.datas
        objectsizeList["field"] = "ObjectSize_Code"
        objectsizeList["pair"] = "ObjectSize_ID"
        objectsizeList["mode"] = "Dropdown"

        ddl = ddl.concat(packList).concat(objectsizeList)
        this.setState({ autocomplete: ddl })
      })))
  }

  getSelectionData(data) {
    this.setState({ selectiondata: data }, () => console.log(this.state.selectiondata))
  }

  createBarcodeBtn(data) {
    return <Button type="button" color="info"
      onClick={() => this.history.push('/mst/sku/manage/barcode?barcodesize=4&barcode=' + data.Code + '&Name=' + data.Name)}>Print</Button>
  }

  render() {
    const view = this.state.permissionView
    const cols = [
      { Header: 'No.', fixed: "left", Type: 'numrows', filterable: false, className: 'center', minWidth: 40, maxWidth: 40 },
      { accessor: 'Code', Header: 'Code', editable: view, Filter: "text", fixed: "left", minWidth: 100, maxWidth: 120 },
      { accessor: 'Name', Header: 'Name', editable: view, Filter: "text", minWidth: 120 },
      { accessor: 'ObjectSize_Code', Header: 'Default Pack Size', updateable: view, Filter: "text", Type: "autocomplete", minWidth: 140 },
      //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown"},
      { accessor: 'LastUpdate', Header: 'Last Update', filterable: false, minWidth: 180, maxWidth: 180 },
      // { accessor: 'Created', Header: 'Create', editable: false, filterable: false, minWidth: 170 },
      /* {accessor: 'CreateTime', Header: 'Create Time', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
      // { accessor: 'Modified', Header: 'Modify', editable: false, filterable: false, minWidth: 170 },
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
        <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} expFilename={"SKUCollection"}
          filterable={true} autocomplete={this.state.autocomplete} accept={view} addExportbtn={view} exportfilebtn={view}
          btn={btnfunc} uneditcolumn={this.uneditcolumn} searchURL={this.props.location.search}
          table="ams_SKUMasterType" />
      </div>
    )
  }


}
export default SKUMasterType;
