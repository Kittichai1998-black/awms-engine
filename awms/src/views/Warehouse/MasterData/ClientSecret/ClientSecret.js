import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import { TableGen } from '../TableSetup';
//import Axios from 'axios';
import { apicall } from '../../ComponentCore'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';

const Axios = new apicall()

class ClientSecret extends Component {
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
        t: "ClientSecret",
        q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
        f: "ID,Code,Name,Description,SecretKey,IPAddress,MacAddress,Status,Created,Modified",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: "",
        l: 100,
        all: "",
      },
      sortstatus: 0,
      selectiondata: [],
    };

    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    this.uneditcolumn = ["Created", "Modified"]
  }

  componentDidMount() {
    document.title = "Client Secret : AWMS";
  }
  async componentWillMount() {
    //permission
    let dataGetPer = await GetPermission()
    CheckWebPermission("ClientSecret", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
  }
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
  render() {
    const view = this.state.permissionView
    const cols = [
      { accessor: 'Code', Header: 'Code', editable: view, Filter: "text", fixed: "left", minWidth: 90, maxWidth: 90 },
      { accessor: 'Name', Header: 'Name', editable: view, Filter: "text", fixed: "left" },
      { accessor: 'Description', Header: 'Description', editable: view, sortable: false, Filter: "text", },
      { accessor: 'SecretKey', Header: 'SecretKey', editable: view, Filter: "text" },
      { accessor: 'IPAddress', Header: 'IPAddress', editable: view, Filter: "text" },
      { accessor: 'MacAddress', Header: 'MacAddress', editable: view, Filter: "text" },
      //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},  
      { accessor: 'Created', Header: 'Create', filterable: false },
      { accessor: 'Modified', Header: 'Modify', filterable: false },
      { Show: view, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove" },


    ];
    const btnfunc = [{
      btntype: "Barcode",
      func: this.createBarcodeBtn
    }]
    //const view  = this.state.permissionView
    return (
      <div>
        {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
      */}
        <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} expFilename={"ClientSecret "}
          filterable={true} accept={view} btn={btnfunc} exportfilebtn={view} addExportbtn={view}
          uneditcolumn={this.uneditcolumn}
          table="ams_ClientSecret" />
      </div>
    )
  }
}

export default ClientSecret;
