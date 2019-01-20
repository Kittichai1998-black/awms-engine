import React, { Component } from 'react';
import "react-table/react-table.css";
import { TableGen } from '../TableSetup';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';

class Branch extends Component {
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
        t: "BranchMaster",
        q: "[{ 'f': 'Status', c:'!=', 'v': 2}]",
        f: "ID,Code,Name,Description,Status,Created,Modified,LastUpdate",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
      },
      sortstatus: 0,
      selectiondata: [],
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.uneditcolumn = ["Created", "Modified", "LastUpdate"]
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
  }
  componentDidMount() {
    document.title = "Branch - AWMS"
  }
  async componentWillMount() {
    //permission
    let dataGetPer = await GetPermission()
    CheckWebPermission("Branch", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
  }
  //permission
  displayButtonByPermission(dataGetPer) {
    let checkview = true
    if (CheckViewCreatePermission("Branch_view", dataGetPer)) {
      checkview = true //แสดงข้อมูลเฉยๆ
    }
    if (CheckViewCreatePermission("Branch_create&modify", dataGetPer)) {
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
  }

  render() {
    const view = this.state.permissionView
    const cols = [
      { Header: 'No.', fixed: "left", Type: 'numrows', filterable: false, className: 'center', minWidth: 40, maxWidth: 40  },
      //{ accessor: 'Code', Header: 'Code', editable: view, Filter: "text", fixed: "left", minWidth: 100,maxWidth: 120 },
      { accessor: 'Name', Header: 'Name', editable: view, Filter: "text", },
      //{accessor: 'Description', Header: 'Description', editable:true,Filter:"text",},
      //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},
      { accessor: 'LastUpdate', Header: 'Last Update', filterable: false, minWidth: 180, maxWidth: 180 },
      // { accessor: 'Created', Header: 'Create', editable: false, filterable: false, minWidth: 170 },
      /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
      // { accessor: 'Modified', Header: 'Modify', editable: false, filterable: false, minWidth: 170 },
      //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
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
          */}
        <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} expFilename={"Branch"}
          filterable={true} btn={btnfunc} uneditcolumn={this.uneditcolumn} accept={view} addExportbtn={view} exportfilebtn={view}
          table="ams_Branch" />
      </div>
    )
  }
}

export default Branch;
