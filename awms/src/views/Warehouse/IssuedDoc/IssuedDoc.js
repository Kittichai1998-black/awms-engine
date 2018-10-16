import React, { Component } from 'react';
import "react-table/react-table.css";
import {Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../MasterData/TableSetup';
import {apicall} from '../ComponentCore'
import moment from 'moment'
import DatePicker from 'react-datepicker'
import Axios from 'axios';
//import Axios from 'axios';

const axois = new apicall()

class IssuedDoc extends Component{
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
      t:"Document",
      q:"[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002},{ 'f': 'status', c:'=', 'v': 1}]",
      f:"ID,Code,SouBranch,SouWarehouse,SouArea,DesCustomer,ForCustomer,Batch,Lot,ActionTime,DocumentDate,EventStatus,RefID,CreateBy,ModifyBy",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:20,
      all:"",},
      sortstatus:0,
      selectiondata:[]
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.createQueryString = this.createQueryString.bind(this)
    this.getSelectionData = this.getSelectionData.bind(this)
    this.dateTimePicker = this.dateTimePicker.bind(this)
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  componentDidMount(){
  }
  
  dateTimePicker(){
    return <DatePicker selected={this.state.date}
    onChange={(e) => {this.setState({date:e})}}
    onChangeRaw={(e) => {
      if (moment(e.target.value).isValid()){
        this.setState({date:e.target.value})
      }
   }}
   dateFormat="DD/MM/YYYY"/>
  }

  createQueryString = (select) => {
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

  getSelectionData(data){
    this.setState({selectiondata:data})
  }

  workingData(data,status){
    let postdata = {docIDs:[]}
    if(data.length > 0){
      data.forEach(rowdata => {
        postdata["docIDs"].push(rowdata.ID)
      })
      if(status==="accept"){
        axois.post(window.apipath + "/api/wm/issued/doc/working", postdata).then((res) => {this.setState({resp:res.data._result.message})})
      }
      else{
        axois.post(window.apipath + "/api/wm/issued/doc/rejected", postdata).then((res) => {this.setState({resp:res.data._result.message})})
      }
    }
  }

  onClickToDesc(data){
    return <Button type="button" color="info" onClick={() => this.history.push('/wms/issueddoc/manage/issuedmanage?ID='+data.ID)}>Detail</Button>
  }

  render(){
    const cols = [
      {Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center"},
      {accessor: 'Code', Header: 'Code',editable:false, Filter:"text"},
      {accessor: 'SouBranch', Header: 'Branch',editable:false, Filter:"text"},
      {accessor: 'SouWarehouse', Header: 'Warehouse', editable:false, Filter:"text",},
      {accessor: 'SouArea', Header: 'Area', editable:false, Filter:"text",},
      {accessor: 'DesCustomer', Header: 'Customer', editable:false, Filter:"text",},
      {accessor: 'ForCustomer', Header: 'For Customer', editable:false, Filter:"text",},
      {accessor: 'Batch', Header: 'Batch', editable:false, Filter:"text",},
      {accessor: 'Lot', Header: 'Lot', editable:false, Filter:"text",},
      {accessor: 'ActionTime', Header: 'Action Time', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      {accessor: 'DocumentDate', Header: 'Document Date', editable:false, Type:"datetime", dateformat:"date",filterable:false},
      {accessor: 'EventStatus', Header: 'Event Status', editable:false ,Filter:"text",},
      {accessor: 'RefID', Header: 'RefID', editable:false,},
      {accessor: 'Created', Header: 'CreateBy', editable:false, filterable:false},
      {accessor: 'Modified', Header: 'ModifyBy', editable:false, filterable:false},
      {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Link"},
    ];

    const btnfunc = [{
      history:this.props.history,
      btntype:"Link",
      func:this.onClickToDesc
    }]
    

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

          <Button style={{background:"#66FF99",borderColor:"#66FF99"}} className="float-right" onClick={() => this.props.history.push('/doc/gi/manage')}>Create Document</Button>
          
          <Button style={{background:"#00CED1",borderColor:"#00CED1"}} className="float-right" onClick={() => {
            let data1 = {"exportName":"DocumentIssuedToShop","whereValues":[this.state.date.format("YYYY-MM-DD")]}
            let data2 = {"exportName":"DocumentIssuedToCD","whereValues":[this.state.date.format("YYYY-MM-DD")]}
            axois.post(window.apipath + "/api/report/export/fileServer", data1)
            axois.post(window.apipath + "/api/report/export/fileServer", data2)
          }}>Export Data</Button>

          <div className="float-right">{this.dateTimePicker()}</div>
        </div>
        <TableGen column={cols} data={this.state.select} addbtn={true} filterable={true}
        statuslist = {this.state.statuslist} getselection={this.getSelectionData} addbtn={false}
        btn={btnfunc}
        accept={false}/>
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

export default IssuedDoc;
