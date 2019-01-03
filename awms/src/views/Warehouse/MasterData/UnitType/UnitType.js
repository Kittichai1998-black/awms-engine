import React, { Component } from 'react';
import "react-table/react-table.css";
import { TableGen } from '../TableSetup';
import Axios from 'axios';
import { createQueryString } from '../../ComponentCore'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';

class UnitType extends Component {
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
        t: "UnitType",
        q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
        f: "ID,Code,Name,Description,ObjectType,Status,Created,Modified",
        g: "",
        s: "[{'f':'Code','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
      },
      sortstatus: 0,
      selectiondata: [],
      enumfield: ["ObjectType"]

    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    this.filterList = this.filterList.bind(this)
    this.uneditcolumn = ["Created", "Modified"]
  }

  onHandleClickCancel(event) {
    this.forceUpdate();
    event.preventDefault();
  }
  componentDidMount() {
    document.title = "Unit Type : AWMS";
  }
  async componentWillMount() {
    this.filterList();
    //permission
    let dataGetPer = await GetPermission()
    CheckWebPermission("UnitType", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
  }
  //permission
  displayButtonByPermission(dataGetPer) {
    let checkview = true
      if (CheckViewCreatePermission("Administrator", dataGetPer)) {
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
  filterList() {
    const objTypeSelect = { queryString: window.apipath + "/api/enum/StorageObjectType" }
    const objType = []
    Axios.all([Axios.get(createQueryString(objTypeSelect)+"&_token="+localStorage.getItem("Token"))]).then(
      (Axios.spread((result) => {
        result.data.forEach(row => {
          objType.push({ ID: row.value, Code: row.name })
        })

        let ddl = [...this.state.autocomplete]
        let objTypeList = {}
        objTypeList["data"] = objType
        objTypeList["field"] = "ObjectType"
        objTypeList["pair"] = "ObjectType"
        objTypeList["mode"] = "Dropdown"
        ddl = ddl.concat(objTypeList)
        this.setState({ autocomplete: ddl })
      })))

  }

  render() {
    const view = this.state.permissionView
    const cols = [
      { accessor: 'Code', Header: 'Code', editable: view, Filter: "text", fixed: "left", minWidth: 90, maxWidth: 90 },
      { accessor: 'Name', Header: 'Name', editable: view, Filter: "text", fixed: "left", minWidth: 150 },
      { accessor: 'ObjectType', Header: 'Object Type', updateable: view, Filter: "text", Type: "autocomplete" },
      //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},

      //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true,},
      /* {accessor: 'Warehouse_Code', Header: 'Warehouse',updateable:false,Filter:"text", Type:"autocomplete"},
      {accessor: 'AreaMasterType_Code', Header: 'AreaMasterType',updateable:false,Filter:"text", Type:"autocomplete"},
      */
      { accessor: 'Created', Header: 'Create', editable: false, filterable: false },
      /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
      { accessor: 'Modified', Header: 'Modify', editable: false, filterable: false },
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
        <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addExportbtn={view} expFilename={"UnitType"}
          filterable={true} autocomplete={this.state.autocomplete} accept={view} exportfilebtn={view}
          btn={btnfunc} uneditcolumn={this.uneditcolumn} enumfield={this.state.enumfield}
          table="ams_UnitType" />
      </div>
    )
  }
}

export default UnitType;
