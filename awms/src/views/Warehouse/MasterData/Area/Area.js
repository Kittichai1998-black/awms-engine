import React, { Component } from 'react';
import "react-table/react-table.css";
import { TableGen } from '../TableSetup';
import Axios from 'axios';
import { apicall, createQueryString } from '../../ComponentCore'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';
const api = new apicall()

class Area extends Component {
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
        t: "AreaMaster",
        q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
        f: "ID,Code,Name,Description,Warehouse_ID,Warehouse_Code,AreaMasterType_ID,AreaMasterType_Code,Status,Created,Modified",
        g: "",
        s: "[{'f':'Code','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
      },
      sortstatus: 0,
      selectiondata: []

    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.filterList = this.filterList.bind(this)
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    this.uneditcolumn = ["Warehouse_Code", "AreaMasterType_Code", "Created", "Modified"]
  }
  componentDidMount() {
    document.title = "Area - AWMS"
  }
  async componentWillMount() {
    this.filterList()
    //permission
    let dataGetPer = await GetPermission()
    CheckWebPermission("Area", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
  }
  //permission
  displayButtonByPermission(dataGetPer) {
    let checkview = true
    if (CheckViewCreatePermission("Area_view", dataGetPer)) {
      checkview = true //แสดงข้อมูลเฉยๆ
    }
    if (CheckViewCreatePermission("Area_create&modify", dataGetPer)) {
      checkview = false //แก้ไข
    }
    if (checkview === true) {
      this.setState({ permissionView: false })
    } else if (checkview === false) {
      this.setState({ permissionView: true })
    }
  }

  onHandleClickCancel(event) {
    this.forceUpdate();
    event.preventDefault();
  }

  componentWillUnmount() {
    Axios.isCancel(true);
  }

  filterList() {
    const whselect = {
      queryString: window.apipath + "/api/mst",
      t: "Warehouse",
      q: "[{ 'f': 'Status', c:'<', 'v': 2}",
      f: "ID,concat(Code,' : ',Name) as Code",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      all: "",
    }

    const areatypeselect = {
      queryString: window.apipath + "/api/mst",
      t: "AreaMasterType",
      q: "[{ 'f': 'Status', c:'<', 'v': 2}",
      f: "ID,concat(Code,' : ',Name) as Code",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      all: "",
    }

    Axios.all([api.get(createQueryString(whselect)), api.get(createQueryString(areatypeselect))]).then(
      (Axios.spread((whresult, areatyperesult) => {
        let ddl = [...this.state.autocomplete]
        let whList = {}
        let areatypelist = {}
        whList["data"] = whresult.data.datas
        whList["field"] = "Warehouse_Code"
        whList["pair"] = "Warehouse_ID"
        whList["mode"] = "Dropdown"

        areatypelist["data"] = areatyperesult.data.datas
        areatypelist["field"] = "AreaMasterType_Code"
        areatypelist["pair"] = "AreaMasterType_ID"
        areatypelist["mode"] = "Dropdown"

        ddl = ddl.concat(whList).concat(areatypelist)
        this.setState({ autocomplete: ddl })
      })))
  }

  render() {
    const view = this.state.permissionView
    const cols = [
      { accessor: 'Code', Header: 'Code', editable: view, Filter: "text", fixed: "left", minWidth: 80, maxWidth: 90 },
      { accessor: 'Name', Header: 'Name', editable: view, Filter: "text", fixed: "left", minWidth: 160 },
      //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true,},
      { accessor: 'Warehouse_Code', Header: 'Warehouse', updateable: view, Filter: "text", Type: "autocomplete", minWidth: 100 },
      { accessor: 'AreaMasterType_Code', Header: 'AreaMasterType', updateable: view, Filter: "text", Type: "autocomplete", minWidth: 170 },
      //{accessor: 'Status', Header: 'Status',Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown"},
      { accessor: 'Created', Header: 'Create', filterable: false, minWidth: 170 },
      /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
      { accessor: 'Modified', Header: 'Modify', editable: false, filterable: false, minWidth: 170 },
      //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      { show: view, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove" },
    ];
    const btnfunc = [{
      btntype: "Barcode",
      func: this.createBarcodeBtn
    }]
    return (
      <div>
        {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
      */}
        <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} expFilename={"Area"}
          filterable={true} autocomplete={this.state.autocomplete} accept={view} addExportbtn={view} exportfilebtn={view}
          btn={btnfunc} uneditcolumn={this.uneditcolumn}
          table="ams_AreaMaster" />
      </div>
    )
  }
}
//permissionEdit={this.state.permissionEdit}
export default Area;
