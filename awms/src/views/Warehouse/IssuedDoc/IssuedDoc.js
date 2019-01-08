import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import { TableGen } from '../MasterData/TableSetup';
import { apicall, DatePicker, GenerateDropDownStatus } from '../ComponentCore'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../ComponentCore/Permission';

const axois = new apicall()

class IssuedDoc extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      autocomplete: [],
      statuslist: [{
        'status': GenerateDropDownStatus("Status"),
        'header': 'Status',
        'field': 'Status',
        'mode': 'check',
      }, {
        'status': GenerateDropDownStatus("DocumentEventStatus"),
        'header': 'EventStatus',
        'field': 'EventStatus',
        'mode': 'check',
      }],
      acceptstatus: false,
      select: {
        queryString: window.apipath + "/api/viw",
        t: "Document",
        q: "[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002}]",
        f: "ID,Code,SouBranchName,SouWarehouseName,SouAreaName,DesCustomerName,DesWarehouseName,ForCustomer,Batch,Lot,ActionTime,DocumentDate,EventStatus,RefID,Ref1,Ref2,Created,ModifyBy",
        g: "",
        s: "[{'f':'ID','od':'desc'}]",
        sk: 0,
        l: 20,
        all: "",
      },
      sortstatus: 0,
      selectiondata: []
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this)
    this.dateTimePicker = this.dateTimePicker.bind(this)
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
  }

  async componentWillMount() {
    document.title = "Search Issue : AWMS";
    //permission
    this.setState({ showbutton: "none" })
    let dataGetPer = await GetPermission()
    CheckWebPermission("GID", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
  }
  //permission
  // 26	TransGID_view
  // 27	TransGID_create&modify
  // 28	TransGID_execute

  displayButtonByPermission(dataGetPer) {
    let check = 0
    if (CheckViewCreatePermission("TransGID_view", dataGetPer)) {
      check = 0 //แสดงข้อมูล26
    }
    if (CheckViewCreatePermission("TransGID_create&modify", dataGetPer)) {
      check = 1 //แก้ไข27
    }
    if (CheckViewCreatePermission("TransGID_execute", dataGetPer)) {
      //แก้ไข28
      if (CheckViewCreatePermission("Administrator", dataGetPer)) {
        check = 3
      } else {
        check = 2
      }
    }
    if (check === 0) {
      var PerButtonWorking = document.getElementById("per_button_working")
      PerButtonWorking.remove()
      var PerButtonReject = document.getElementById("per_button_reject")
      PerButtonReject.remove()
      var PerButtonExport = document.getElementById("per_button_export")
      PerButtonExport.remove()
      var PerButtonDate = document.getElementById("per_button_date")
      PerButtonDate.remove()

    } else if (check === 1) {
      this.setState({ showbutton: "block" })
      var PerButtonExport = document.getElementById("per_button_export")
      PerButtonExport.remove()
      var PerButtonDate = document.getElementById("per_button_date")
      PerButtonDate.remove()
    } else if (check === 2) {
      this.setState({ showbutton: "block" })
      var PerButtonWorking = document.getElementById("per_button_working")
      PerButtonWorking.remove()
      var PerButtonReject = document.getElementById("per_button_reject")
      PerButtonReject.remove()
      var PerButtonDoc = document.getElementById("per_button_doc")
      PerButtonDoc.remove()
    } else if (check === 3) {
      this.setState({ showbutton: "block" })
    }
  }
  //permission

  onHandleClickCancel(event) {
    this.forceUpdate();
    event.preventDefault();
  }

  componentDidMount() {
    GenerateDropDownStatus("Status")
  }

  dateTimePicker() {
    return <DatePicker onChange={(e) => { this.setState({ date: e }) }} dateFormat="DD-MM-YYYY" />
  }

  getSelectionData(data) {
    this.setState({ selectiondata: data })
  }

  componentWillUnmount() {
    this.state = {}
  }

  workingData(data, status) {
    let postdata = { docIDs: [], auto: 1 }
    if (data.length > 0) {
      data.forEach(rowdata => {
        postdata["docIDs"].push(rowdata.ID)
      })
      if (status === "accept") {
        axois.post(window.apipath + "/api/wm/issued/doc/working", postdata).then((res) => { this.setState({ resp: res.data._result.message }) })
      }
      if (status === "reject") {
        axois.post(window.apipath + "/api/wm/issued/doc/rejected", postdata).then((res) => { this.setState({ resp: res.data._result.message }) })
      }
      if (status === "Close") {
        axois.post(window.apipath + "/api/wm/issued/doc/Closing", postdata).then((res) => { this.setState({ resp: res.data._result.message }) })
      }
    }
  }

  onClickToDesc(data) {
    return <Button type="button" color="primary" style={{ background: "#26c6da", borderColor: "#26c6da" }}
      onClick={() => this.history.push('/doc/gi/manage?ID=' + data.ID)}>Detail</Button>
  }

  render() {
    const cols = [
      { Header: '', Type: "selection", sortable: false, Filter: "select", className: "text-center", fixed: "left", minWidth: 50 },
      { accessor: 'EventStatus', Header: 'Event Status', editable: false, Filter: "dropdown", Type: "DocumentEvent", fixed: "left", minWidth: 120, className: 'center' },
      { accessor: 'Code', Header: 'Doc No.', editable: false, Filter: "text", fixed: "left", Cell: (e) => <a style={{ color: '#20a8d8', textDecorationLine: 'underline', cursor: 'pointer' }} onClick={() => this.props.history.push('/doc/gi/manage?ID=' + e.original.ID)} >{e.original.Code}</a> },
      { accessor: 'DocumentDate', Header: 'Doc.Date', editable: false, Type: "datetime", dateformat: "date", filterable: false },
      { accessor: 'DesCustomerName', Header: 'Des.Customer', editable: false, Filter: "text" },
      //{accessor: 'SouBranchName', Header: 'Branch',editable:false, Filter:"text"},
      { accessor: 'DesWarehouseName', Header: 'Des.Warehouse', editable: false, Filter: "text", },
      //{accessor: 'SouAreaName', Header: 'Area', editable:false, Filter:"text",},
      // {accessor: 'ForCustomer', Header: 'For Customer', editable:false, Filter:"text",},
      { accessor: 'Batch', Header: 'Batch', editable: false, Filter: "text", },
      { accessor: 'RefID', Header: 'Mat.Doc No.', editable: false, Filter: "text", },
      { accessor: 'Ref1', Header: 'Mat.Doc Year', editable: false, Filter: "text", },
      { accessor: 'Ref2', Header: 'Movement', editable: false, Filter: "text", },
      // {accessor: 'Lot', Header: 'Lot', editable:false, Filter:"text",},
      { accessor: 'ActionTime', Header: 'Action Time', editable: false, Type: "datetime", dateformat: "datetime", filterable: false },
      //movementtype
      //{accessor: 'RefID', Header: 'RefID', editable:false,},
      { accessor: 'Created', Header: 'Create', editable: false, filterable: false },
      //{accessor: 'Modified', Header: 'ModifyBy', editable:false, filterable:false},
      //{ Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Link" },
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

          <Button id="per_button_doc" style={{ background: "#66bb6a", borderColor: "#66bb6a", width: '130px', marginLeft: '5px', display: this.state.showbutton }} color="primary" className="float-right" onClick={() => this.props.history.push('/doc/gi/manage')}>Create Document</Button>

          <Button id="per_button_export" style={{ background: "#26c6da", borderColor: "#26c6da", width: '130px', marginLeft: '5px', display: this.state.showbutton }} color="primary" className="float-right" onClick={() => {
            let data1 = { "exportName": "DocumentIssuedToShop", "whereValues": [this.state.date.format('YYYY-MM-DD')] }
            let data2 = { "exportName": "DocumentIssuedToCD", "whereValues": [this.state.date.format('YYYY-MM-DD')] }
            axois.post(window.apipath + "/api/report/export/fileServer", data1).then(res => {
              if (res.data._result.status === 1) {
                let resultPath = res.data.fileExport
                axois.post(window.apipath + "/api/report/export/fileServer", data2).then(res2 => {
                  window.success(resultPath + "<br/>" + res2.data.fileExport)
                })
              }
            })
          }}>Export Data</Button>
          <div id="per_button_date" className="float-right" style={{ display: this.state.showbutton }}>{this.dateTimePicker()}</div>
        </div>
        <TableGen column={cols} data={this.state.select} addbtn={true} filterable={true}
          dropdownfilter={this.state.statuslist} getselection={this.getSelectionData} addbtn={false}
          btn={btnfunc} defaultCondition={[{ 'f': 'DocumentType_ID', c: '=', 'v': 1002 }, { 'f': 'EventStatus', c: '!=', 'v': 32 }]}
          accept={false} />
        <Card>
          <CardBody>
            <Button id="per_button_reject" style={{ background: "#ef5350", borderColor: "#ef5350", width: '130px', marginLeft: '5px', display: this.state.showbutton }} onClick={() => this.workingData(this.state.selectiondata, "reject")} color="danger" className="float-right">Reject</Button>
            <Button id="per_button_working" style={{ background: "#26c6da", borderColor: "#26c6da", width: '130px', marginLeft: '5px', display: this.state.showbutton }} onClick={() => this.workingData(this.state.selectiondata, "accept")} color="primary" className="float-right">Working</Button>
            <Button id="per_button_working" style={{ background: "primary", borderColor: "primary", width: '130px', display: this.state.showbutton }} onClick={() => this.workingData(this.state.selectiondata, "Close")} color="primary" className="float-right">Close</Button>
            {this.state.resp}
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default IssuedDoc;
