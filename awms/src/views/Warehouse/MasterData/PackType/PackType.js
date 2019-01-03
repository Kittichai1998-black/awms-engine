import React, { Component } from 'react';
import "react-table/react-table.css";
import { TableGen } from '../TableSetup';
import Axios from 'axios';
import { createQueryString } from '../../ComponentCore'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';

class PackType extends Component {
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
        t: "PackMasterType",
        q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
        f: "ID,Code,Name,Description,Status,Created,Modified",
        g: "",
        s: "[{'f':'Code','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
      },
      sortstatus: 0,
      selectiondata: [],
    };
    this.uneditcolumn = ["Created", "Modified"]
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
  }
  componentDidMount() {
    document.title = "Pack Type - AWMS"
  }
  async componentWillMount() {
    //permission
    let dataGetPer = await GetPermission()
    CheckWebPermission("PackType", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
  }
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

  render() {
    const view = this.state.permissionView
    const cols = [
      { accessor: 'Code', Header: 'Code', editable: view, Filter: "text", fixed: "left" },
      { accessor: 'Name', Header: 'Name', editable: view, Filter: "text", fixed: "left" },
      //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true,},
      { accessor: 'Status', Header: 'Status', editable: view, Type: "checkbox", Filter: "dropdown", Filter: "dropdown" },
      { accessor: 'Created', Header: 'Create', editable: false, filterable: false },
      /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
      { accessor: 'Modified', Header: 'Modify', editable: false, filterable: false },
      //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      { Show: view, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove" },
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
        <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist}
          filterable={true} accept={view} btn={btnfunc} uneditcolumn={this.uneditcolumn} addExportbtn={view} exportfilebtn={view} expFilename={"PackType"}
          table="ams_PackMasterType" />
      </div>
    )
  }

}
export default PackType;