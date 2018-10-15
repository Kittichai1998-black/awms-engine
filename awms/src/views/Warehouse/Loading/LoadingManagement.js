import React, { Component } from 'react';
import "react-table/react-table.css";
import {Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../MasterData/TableSetup';
//import Axios from 'axios';
import {apicall} from '../ComponentCore'
import {EventStatus} from '../Status'

const Axios =  new apicall()

const createQueryString = (select) => {
  let queryS = select.queryString + (select.t === "" ? "?" : "?t=" + select.t)
  + (select.q === "" ? "" : "&q=" + select.q)
  + (select.f === "" ? "" : "&f=" + select.f)
  + (select.g === "" ? "" : "&g=" + select.g)
  + (select.s === "" ? "" : "&s=" + select.s)
  + (select.sk === "" ? "" : "&sk=" + select.sk)
  + (select.l === 0 ? "" : "&l=" + select.l)
  + (select.all === "" ? "" : "&all=" + select.all)
  return queryS
}

class LoadingManage extends Component{
  constructor(props) {
    super(props);
    this.state = {
      data : [],
      autocomplete:[],
      statuslist:[{
        'status' : [{'value':'0','label':'Inactive'},{'value':'1','label':'Active'},{'value':'*','label':'All'}],
        'header' : 'Status',
        'field' : 'Status',
        'mode' : 'check',
      },{
        'status' : [{'value':'0','label':'Inactive'},{'value':'1','label':'Active'},{'value':'*','label':'All'}],
        'header' : 'E',
        'field' : 'Status',
        'mode' : 'check',
      }],
      acceptstatus : false,
      select:{queryString:window.apipath + "/api/viw",
      t:"Loading",
      q:"[{ 'f': 'DocumentType_ID', c:'=', 'v': 1012},{ 'f': 'status', c:'in', 'v': 1}]",
      f:"ID,Code,DocumentType_ID,Transport_ID,ActionTime,DocumentDate,EventStatus,Status,CreateTime,ModifyTime,Remark,IssuedCode,LinkDocument_ID",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:20,
      all:"",},
      sortstatus:0,
      selectiondata:[]
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this)

    this.select={queryString:window.apipath + "/api/viw",
      t:"Document",
      q:"[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002},{ 'f': 'status', c:'=', 'v': 1},{ 'f': 'eventStatus', c:'=', 'v': 11}]",
      f:"ID,Code",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:0,
      all:"",}
  }

  workingData(data,status){
    let postdata = []
    if(data.length > 0){
      data.forEach(rowdata => {
        postdata.push({docID:rowdata.ID})
      })
      if(status==="accept"){
        Axios.post(window.apipath + "/api/wm/loading/doc/workpicking", postdata).then((res) => {this.setState({resp:res.data._result.message})})
      }
      else{
        Axios.post(window.apipath + "/api/wm/loading/doc/reject", postdata).then((res) => {this.setState({resp:res.data._result.message})})
      }
    }
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  getSelectionData(data){
    this.setState({selectiondata:data})
  }

  render(){
    const cols = [
      {Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center"},
      {accessor: 'Code', Header: 'Loading Code',editable:false, Filter:"text"},
      {accessor: 'IssuedCode', Header: 'Issued Code',editable:false, Filter:"text"},
      {accessor: 'ActionTime', Header: 'Action Time', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      {accessor: 'DocumentDate', Header: 'Document Date', editable:false, Type:"datetime", dateformat:"date",filterable:false},
      {accessor: 'EventStatus', Header: 'Event Status', editable:false ,Filter:"text", Type:"EventStatus"},
      {accessor: 'CreateTime', Header: 'CreateBy', editable:false,Type:"datetime", filterable:false},
      {accessor: 'ModifyTime', Header: 'ModifyBy', editable:false,Type:"datetime", filterable:false},
      {accessor: 'Remark', Header: 'Remark', editable:false,},
    ];

    return(
      <div>
      {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
        addbtn = เปิดปิดปุ่ม Add
        accept = สถานะของในการสั่ง update หรือ insert 
    
      */}
        <div className="clearfix">
          <Button className="float-right" onClick={() => this.props.history.push('/wms/loading/manage/loadingdocument')}>Create Document</Button>
        </div>
        <TableGen column={cols} data={this.state.select} addbtn={true} filterable={true}
        statuslist = {this.state.statuslist} getselection={this.getSelectionData} addbtn={false}
        accept={false} defalutCondition={[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002},{ 'f': 'status', c:'=', 'v': 1},{ 'f': 'eventStatus', c:'=', 'v': 11}]}/>
        <Card>
          <CardBody>
            <Button onClick={() => this.workingData(this.state.selectiondata,"accept")} color="primary"className="mr-sm-1">Working</Button>
            <Button onClick={() => this.workingData(this.state.selectiondata,"reject")} color="danger"className="mr-sm-1">Reject</Button>
            {this.state.resp}
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default LoadingManage;
