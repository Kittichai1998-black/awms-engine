import React, { Component } from 'react';
import "react-table/react-table.css";
import {Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../MasterData/TableSetup';
//import Axios from 'axios';
import {apicall, GenerateDropDownStatus} from '../ComponentCore'
import {GetPermission,Nodisplay} from '../../ComponentCore/Permission';

const Axios =  new apicall()

class LoadingManage extends Component{
  constructor() {
    super();
    this.state = {
      data : [],
      autocomplete:[],
      statuslist:[{
        'status' : GenerateDropDownStatus("Status"),
        'header' : 'Status',
        'field' : 'Status',
        'mode' : 'check',
      },{
        'status' : GenerateDropDownStatus("DocumentEventStatus"),
        'header' : 'EventStatus',
        'field' : 'EventStatus',
        'mode' : 'check',
      }],
      acceptstatus : false,
      select:{queryString:window.apipath + "/api/viw",
      t:"Loading",
      q:"[{ 'f': 'DocumentType_ID', c:'=', 'v': 1012}]",
      f:"ID,Code,CustomerName,DocumentType_ID,Transport_ID,ActionTime,DocumentDate,EventStatus,Status,CreateTime,ModifyTime,Remark,IssuedCode,LinkDocument_ID",
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
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)

    this.select={queryString:window.apipath + "/api/viw",
      t:"Document",
      q:"[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002}]",
      f:"ID,Code",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:0,
      all:"",}
  }

  async componentWillMount(){
    //permission
    this.setState({showbutton:"none"})
    let data = await GetPermission()
    Nodisplay(data,31,this.props.history)
    this.displayButtonByPermission(data)
    //permission
  }
  //permission
displayButtonByPermission(perID){
  this.setState({perID:perID})
  let check = false
  perID.forEach(row => {
      if(row === 31){
        check = true
      }else if(row === 32){
        check = false
      }
    })
       if(check === true){  
          var PerButtonReject = document.getElementById("per_button_Reject")
          PerButtonReject.remove()     
          var PerButtoWorking = document.getElementById("per_button_Working")
          PerButtoWorking.remove()    
          var PerButtonCrete = document.getElementById("per_button_create")
          PerButtonCrete.remove() 
 
       }else if(check === false){
          this.setState({showbutton:"block"})
       }else{
          this.props.history.push("/404")
       } 
  }
  //permission

  workingData(data,status){
    let postdata = []
    if(data.length > 0){
      data.forEach(rowdata => {
        postdata.push(rowdata.ID)
      })
      if(status==="accept"){
        Axios.post(window.apipath + "/api/wm/loading/doc/working", {docIDs:postdata}).then((res) => {this.setState({resp:res.data._result.message})})
      }
      else{
        Axios.post(window.apipath + "/api/wm/loading/doc/reject", {docIDs:postdata}).then((res) => {this.setState({resp:res.data._result.message})})
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
      {accessor: 'CustomerName', Header: 'Customer Name',editable:false, Filter:"text"},
      {accessor: 'ActionTime', Header: 'Action Time', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      {accessor: 'DocumentDate', Header: 'Document Date', editable:false, Type:"datetime", dateformat:"date",filterable:false},
      {accessor: 'EventStatus', Header: 'Event Status', editable:false ,Filter:"dropdown", Type:"DocumentEvent"},
      {accessor: 'CreateTime', Header: 'CreateBy', editable:false,Type:"datetime", filterable:false},
      {accessor: 'ModifyTime', Header: 'ModifyBy', editable:false,Type:"datetime", filterable:false},
      { accessor: 'Remark', Header: 'Remark', editable: false, filterable: false },
      {editable: false, filterable: false,  Cell:(e) => {
        return <Button color="primary" style={{ background: "#26c6da", borderColor: "#26c6da" }}
          onClick={() => { this.props.history.push('/doc/ld/manage?ID='+ e.original.ID)
        }
      }>Detail</Button>}},
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
        <div className="clearfix" id="per_button_create" style={{display:this.state.showbutton}}>
          <Button style={{ background: "#66bb6a", borderColor: "#66bb6a" }} color="primary" className="float-right" onClick={() => this.props.history.push('/doc/ld/manage')}>Create Document</Button>
        </div>
        <TableGen column={cols} data={this.state.select} filterable={true}
        dropdownfilter = {this.state.statuslist} getselection={this.getSelectionData} addbtn={false}
        accept={false} defalutCondition={[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002},{ 'f': 'status', c:'=', 'v': 1},{ 'f': 'eventStatus', c:'=', 'v': 11}]}/>
        <Card >
          <CardBody >
            <Button style={{ background: "#26c6da", borderColor: "#26c6da", width: '130px'}}
              onClick={() => this.workingData(this.state.selectiondata, "accept")} color="primary" id="per_button_Working" style={{display:this.state.showbutton}} className="float-right" >Working</Button>
            <Button style={{ background: "#ef5350", borderColor: "#ef5350", width: '130px' }}
              onClick={() => this.workingData(this.state.selectiondata, "reject")} color="danger" id="per_button_Reject" style={{display:this.state.showbutton}} className="float-right">Reject</Button>
            {this.state.resp}
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default LoadingManage;
