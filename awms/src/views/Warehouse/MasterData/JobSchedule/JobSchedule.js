import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import { TableGen } from '../TableSetup';
//import Axios from 'axios';
import { apicall } from '../../ComponentCore'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';

const Axios = new apicall()

class JobSchedule extends Component {
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
        t: "JobSchedule",
        q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
        f: "ID,Code,Name,Description,CronExpressions,Status,Created,Modified",
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
    document.title = "Job Schedule : AWMS";
  }
  //permission
  async componentWillMount() {
    //permission
    let dataGetPer = await GetPermission()
    CheckWebPermission("JobSchedule", dataGetPer, this.props.history);
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
      { Header: 'No.', fixed: "left", Type: 'numrows', filterable: false, className: 'center', minWidth: 40 },
      { accessor: 'Code', Header: 'Code', editable: view, Filter: "text", fixed: "left" },
      { accessor: 'Name', Header: 'Name', editable: view, Filter: "text", fixed: "left" },
      { accessor: 'Description', Header: 'Description', editable: view, sortable: false, Filter: "text", },
      { accessor: 'CronExpressions', Header: 'CronExpressions', editable: view, Filter: "text" },
      //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},  
      { accessor: 'Created', Header: 'Create', filterable: false },
      { accessor: 'Modified', Header: 'Modify', filterable: false },
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
        <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addExportbtn={view} expFilename={"JobSchedule"}
          filterable={true} accept={view} btn={btnfunc} exportfilebtn={view}
          uneditcolumn={this.uneditcolumn}
          table="ams_JobSchedule" />
      </div>
    )
  }
}

export default JobSchedule;
