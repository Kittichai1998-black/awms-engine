import React, { Component } from 'react';
import "react-table/react-table.css";
import { Button } from 'reactstrap';
import { TableGen } from '../../MasterData/TableSetup';
//import Axios from 'axios';
import {apicall, DatePicker, GenerateDropDownStatus} from '../../ComponentCore'
import moment from 'moment';

const Axios = new apicall()

class IssuedDoc extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data : [],
      autocomplete:[],
      statuslist:[{
        'status' : GenerateDropDownStatus("DocumentStatus"),
        'header' : 'Status',
        'field' : 'Status',
        'mode' : 'check',
      },{
        'status' : GenerateDropDownStatus("DocumentEventStatus"),
        'header' : 'EventStatus',
        'field' : 'EventStatus',
        'mode' : 'check',
      }],
      acceptstatus: false,
      select: {
        queryString: window.apipath + "/api/viw",
        t: "Document",
        q: "[{ 'f': 'DocumentType_ID', c:'=', 'v': 1001},{'f':'Status','c':'!=','v':2}]",
        f: "ID,Code,SouBranchName,Status,DesWarehouseName,DesAreaName,SouCustomerName,ForCustomer,Batch,Lot,DocumentDate,EventStatus,RefID,Created,ModifyBy,ActionTime",
        g: "",
        s: "[{'f':'Code','od':'asc'}]",
        sk: 0,
        l: 10,
        all: "",
      },
      sortstatus: 0,
      selectiondata: []
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this)
    this.dateTimePicker = this.dateTimePicker.bind(this)
  }

  onHandleClickCancel(event) {
    this.forceUpdate();
    event.preventDefault();
  }

  dateTimePicker() {
    return <DatePicker onChange={(e) => { this.setState({ date: e }) }} dateFormat="DD/MM/YYYY" />
  }

  getSelectionData(data) {
    this.setState({ selectiondata: data })
  }

  workingData() {
    if (this.state.date) {
      let postdata = {
        "exportName": "DocumentReceivedToCD",
        "whereValues": [this.state.date.format('YYYY-MM-DD')]
      }
      Axios.post(window.apipath + "/api/report/export/fileServer", postdata).then(res => {
        if (res.data._result.status === 1) {
          window.success(res.data.fileExport)
        }
      })
    }
  }

  onClickToDesc(data) {
    return <Button style={{color:"white"}} type="button" color="info" onClick={() => this.history.push('/doc/gr/view?docID=' + data.ID)}>Detail</Button>
  }

  render() {
    const cols = [
      {accessor: 'Code', Header: 'Code',editable:false, Filter:"text"},
      //{accessor: 'DesBranchName', Header: 'Branch',editable:false, Filter:"text"},
      {accessor: 'DesWarehouseName', Header: 'Warehouse', editable:false, Filter:"text",},
      {accessor: 'DesAreaName', Header: 'Area', editable:false, Filter:"text",},
      // {accessor: 'SouCustomer', Header: 'Customer', editable:false, Filter:"text",},
      // {accessor: 'ForCustomer', Header: 'For Customer', editable:false, Filter:"text",},
      // {accessor: 'Batch', Header: 'Batch', editable:false, Filter:"text",},
      // {accessor: 'Lot', Header: 'Lot', editable:false, Filter:"text",},
      {accessor: 'Status', Header: 'Status', editable:false, Filter:"dropdown", Type:"DocumentStatus"},
      {accessor: 'EventStatus', Header: 'Event Status', editable:false ,Filter:"dropdown", Type:"DocumentEvent"},
      //{accessor: 'ActionTime', Header: 'Action Time', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      {accessor: 'DocumentDate', Header: 'Document Date', editable:false, Type:"datetime", dateformat:"date",filterable:false},
      //{accessor: 'RefID', Header: 'RefID', editable:false,},
      {accessor: 'Created', Header: 'CreateBy', editable:false, filterable:false},
      //{accessor: 'Modified', Header: 'ModifyBy', editable:false, filterable:false},
      {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Link"},
    ];

    const btnfunc = [{
      history: this.props.history,
      btntype: "Link",
      func: this.onClickToDesc
    }]

    return (
      <div>
        {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
        addbtn = เปิดปิดปุ่ม Add
        accept = สถานะของในการสั่ง update หรือ insert 
    
      */}
        <div className="clearfix">
          <Button className="float-right" style={{ background: "#26c6da", borderColor: "#26c6da", width: '130px' }} color="primary"
            onClick={() => { this.workingData() }}>Export Data</Button>

          <div className="float-right">{this.dateTimePicker()}</div>
        </div>

        <TableGen column={cols} data={this.state.select} addbtn={true} filterable={true}
        dropdownfilter = {this.state.statuslist} getselection={this.getSelectionData} addbtn={false}
        btn={btnfunc} defaultCondition={[{'f':'Status','c':'!=','v':2},{ 'f': 'DocumentType_ID', c:'=', 'v': 1001}]}
        accept={false}/>
      </div>
    )
  }
}

export default IssuedDoc;
