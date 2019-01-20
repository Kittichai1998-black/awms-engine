import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import { TableGen } from '../TableSetup';
import { apicall } from '../../ComponentCore'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';

const Axios = new apicall()

class Supplier extends Component {
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
        t: "SupplierMaster",
        q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
        f: "ID,Code,Name,Description,Status,Created,Modified,LastUpdate",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: "",
        l: 100,
        all: "",
      },
      sortstatus: 0,
      selectiondata: [],
    };
    this.onHandleClickLoad = this.onHandleClickLoad.bind(this);
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    this.uneditcolumn = ["Created", "Modified", "LastUpdate"]
  }
  componentDidMount() {
    document.title = "Supplier - AWMS"
  }
  async componentWillMount() {
    //permission
    let dataGetPer = await GetPermission()
    CheckWebPermission("Supplier", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
  }
  //permission
  displayButtonByPermission(dataGetPer) {
    let checkview = true
    if (CheckViewCreatePermission("Supplier_view", dataGetPer)) {
      checkview = true //แสดงข้อมูลเฉยๆ
    }
    if (CheckViewCreatePermission("Supplier_create&modify", dataGetPer)) {
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

  onHandleClickLoad(event) {
    Axios.post(window.apipath + "/api/mst/TransferFileServer/SupplierMst", {})
    this.forceUpdate();
  }

  render() {
    const view = this.state.permissionView
    const cols = [
      {
        Header: 'No.', fixed: "left", Type: 'numrows', filterable: false, className: 'center', minWidth: 40, maxWidth: 40 },
      { accessor: 'Code', Header: 'Code', editable: view, Filter: "text", fixed: "left", minWidth: 90 },
      { accessor: 'Name', Header: 'Name', editable: view, Filter: "text", minWidth: 150 },
      //{accessor: 'Description', Header: 'Description', sortable:false, editable:false, Filter:"text",},
      //{ accessor: 'Status', Header: 'Status', editable: true, Type:"checkbox" ,Filter:"dropdown"},
      /* {accessor: 'Revision', Header: 'Revision', editable:false}, */
      { accessor: 'LastUpdate', Header: 'Last Update', filterable: false, minWidth: 180, maxWidth: 180 },
      // { accessor: 'Created', Header: 'Create', editable: false, filterable: false },
      /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false}, */
      // { accessor: 'Modified', Header: 'Modify', editable: false, filterable: false },
      //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false},
      { show: view, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove" }
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
        {/*<div className="clearfix">
          <Button id="per_button_load" className="float-right" style={{ background: "#ef5350", borderColor: "#ef5350",display:this.state.showbutton }}
            onClick={this.onHandleClickLoad} color="danger">Load ข้อมูล Supplier</Button>
      </div>*/}
        <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addExportbtn={view} expFilename={"Supplier"}
          filterable={true} btn={btnfunc} uneditcolumn={this.uneditcolumn} accept={view} exportfilebtn={view}
          table="ams_Supplier" />

      </div>
    )
  }
}

export default Supplier;
