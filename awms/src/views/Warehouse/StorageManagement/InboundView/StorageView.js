import React, { Component } from 'react';
import "react-table/react-table.css";
import { Badge, Card, CardBody, Button } from 'reactstrap';
import { TableGen } from '../../MasterData/TableSetup';
//import Axios from 'axios';
import { apicall, DatePicker, GenerateDropDownStatus, createQueryString } from '../../ComponentCore'
import moment from 'moment';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';
import Axios from 'axios';


const axois = new apicall()

class IssuedDoc extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      autocomplete: [],
      statuslist: [{
        'status': GenerateDropDownStatus("DocumentStatus"),
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
        t: "LinkDocument",
        q: "[{ 'f': 'DocumentType_ID', c:'=', 'v': '1001'}]",
        f: "*",
        g: "",
        s: "[{'f':'Code','od':'desc'}]",
        sk: 0,
        l: 10,
        all: "",
      },
      sortstatus: 0,
      selectiondata: []
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this)
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
  }

  async componentWillMount() {
    document.title = "Search Receive : AWMS";
    //permission
    this.setState({ showbutton: "none" })
    let dataGetPer = await GetPermission()
    CheckWebPermission("GRDoc", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
  }

  //permission 21-TransGRD_view 20-TransGRD_execute
  displayButtonByPermission(dataGetPer) {
    let checkview = true
    if (CheckViewCreatePermission("TransGRD_view", dataGetPer)) {
      checkview = true //แสดงข้อมูล
    }
    if (CheckViewCreatePermission("TransGRD_execute", dataGetPer)) {
      checkview = false //แก้ไข
    }
    if (checkview === true) {
      var PerButtonExport = document.getElementById("per_button_export")
      PerButtonExport.remove()
      var PerButtonDate = document.getElementById("per_button_date")
      PerButtonDate.remove()
    } else if (checkview === false) {
      this.setState({ showbutton: "block" })
    }
  }

  onHandleClickCancel(event) {
    this.forceUpdate();
    event.preventDefault();
  }

  getSelectionData(data) {
    this.setState({ selectiondata: data })
  }

  onClickToDesc(data) {
    return <Button style={{ color: "white" }} type="button" color="info" onClick={() => this.history.push('/doc/gr/view?docID=' + data.ID)}>Detail</Button>
  }

  getSelectionData(data) {
    this.setState({ selectiondata: data })
  }

  workingData(data, status) {
    let postdata = { docIDs: [] }
    if (data.length > 0) {
      data.forEach(rowdata => {
        postdata["docIDs"].push(rowdata.ID)
      })
      if (status === "reject") {
        axois.post(window.apipath + "/api/wm/received/doc/rejected", postdata).then((res) => { this.setState({ resp: res.data._result.message }) })
      } else {
        axois.post(window.apipath + "/api/wm/received/doc/close", postdata).then((res) => { this.setState({ resp: res.data._result.message }) })

      }
    }
  }

  render() {
    const cols = [
      { Header: '', Type: "selection", sortable: false, Filter: "select", className: "text-center", fixed: "left", minWidth: 50 },
      { accessor: 'EventStatus', Header: 'Event Status', editable: false, Filter: "dropdown", Type: "DocumentEvent", fixed: "left", minWidth: 120, className: 'center' },
      { accessor: 'Code', Header: 'Doc No.', editable: false, Filter: "text", fixed: "left", Cell: (e) => <a style={{ color: '#20a8d8', textDecorationLine: 'underline', cursor: 'pointer' }} onClick={() => this.props.history.push('/doc/gr/view?docID=' + e.original.ID)} >{e.original.DocumentType_ID === 1101 ? e.original.CodeDocItem : e.original.Code}</a> },
      { accessor: 'Super', Header: 'SAP Ref', editable: false, Filter: "text" },
      //{accessor: 'CodeDocItem', Header: 'CodeDocItem', editable:false, Filter:"text",},
      { accessor: 'DocumentDate', Header: 'Doc.Date', editable: false, Type: "datetime", dateformat: "date", filterable: "" },
      { accessor: 'SouWarehouseName', Header: 'Sou.Warehouse', editable: false, Filter: "text", },
      { accessor: 'SouBranchName', Header: 'Sou.Branch', editable: false, Filter: "text", },
      { accessor: 'DesWarehouseName', Header: 'Des.Warehouse', editable: false, Filter: "text", },
      { accessor: 'DesBranchName', Header: 'Des.Branch', editable: false, Filter: "text", },
      { accessor: 'RefID', Header: 'Mat.Doc No.', editable: false, Filter: "text", },
      { accessor: 'Ref1', Header: 'Mat.Doc Years', editable: false, Filter: "text", },
      { accessor: 'Ref2', Header: 'Movement', editable: false, Filter: "text", },
      //{accessor: 'Link', Header: 'Link', editable:false, Filter:"text",},
      { accessor: 'Created', Header: 'Create', editable: false, filterable: false },
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
        {/* <div className="clearfix" style={{ display: this.state.showbutton }} >
          <Button style={{ background: "#66bb6a", borderColor: "#66bb6a", width: '130px', display: this.state.showbutton }} color="primary" className="float-right" onClick={() => this.props.history.push('/doc/gr/manage')}>Create Document</Button>
        </div> */}

        <TableGen column={cols} data={this.state.select} addbtn={true} filterable={true}
          dropdownfilter={this.state.statuslist} getselection={this.getSelectionData} addbtn={false}
          btn={btnfunc} defaultPageSize={100000} defaultCondition={[{ 'f': 'DocumentType_ID', c: '=', 'v': 1001 }]}
          accept={false} sapBtn={true} />

        <Card>
          <CardBody>
            <Button id="per_button_reject" style={{ background: "primary", borderColor: "primary", width: '130px', marginLeft: '5px', display: this.state.showbutton }}
              onClick={() => this.workingData(this.state.selectiondata, "reject")} color="primary" className="float-right">Reject</Button>
            <Button id="per_button_reject" style={{ background: "#ef5350", borderColor: "#ef5350", width: '130px', display: this.state.showbutton }}
              onClick={() => this.workingData(this.state.selectiondata, "Close")} color="danger" className="float-right">Close</Button>
            {this.state.resp}
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default IssuedDoc;
