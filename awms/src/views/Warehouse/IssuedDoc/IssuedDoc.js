import React, { Component } from 'react';
import "react-table/react-table.css";
import {Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../MasterData/TableSetup';
import {apicall, DatePicker, GenerateDropDownStatus} from '../ComponentCore'
import GetPermission from '../../ComponentCore/Permission';

const axois = new apicall()

class IssuedDoc extends Component{
  constructor(props) {
    super(props);

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
      t:"Document",
      q:"[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002}]",
      f:"ID,Code,SouBranchName,SouWarehouseName,SouAreaName,DesCustomerName,ForCustomer,Batch,Lot,ActionTime,DocumentDate,EventStatus,RefID,Created,ModifyBy",
      g:"",
      s:"[{'f':'ID','od':'desc'}]",
      sk:0,
      l:20,
      all:"",},
      sortstatus:0,
      selectiondata:[]
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this)
    this.dateTimePicker = this.dateTimePicker.bind(this)
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
  }

  componentWillMount(){
    //permission
    this.setState({showbutton:"none"})
    GetPermission(this.displayButtonByPermission)
    //permission
  }
//permission
displayButtonByPermission(perID){
  this.setState({perID:perID})
  let check = 0
  perID.forEach(row => {
      if(row === 26){
        check = 0
      }if(row === 27){
        check = 1
      }if(row === 28){
        if(check === 1){
            check = 3
        }else{
            check = 2
        }
       }
     })
     if(check === 0){  
        var PerButtonWorking = document.getElementById("per_button_working")
        PerButtonWorking.remove()     
        var PerButtonReject = document.getElementById("per_button_reject")
        PerButtonReject.remove()    
        var PerButtonExport = document.getElementById("per_button_export")
        PerButtonExport.remove()
        var PerButtonDate = document.getElementById("per_button_date")
        PerButtonDate.remove() 

     }else if(check === 1){
        this.setState({showbutton:"block"})
        var PerButtonExport = document.getElementById("per_button_export")
        PerButtonExport.remove()
        var PerButtonDate = document.getElementById("per_button_date")
        PerButtonDate.remove() 
     }else if(check === 2){
        this.setState({showbutton:"block"})
        var PerButtonWorking = document.getElementById("per_button_working")
        PerButtonWorking.remove()     
        var PerButtonReject = document.getElementById("per_button_reject")
        PerButtonReject.remove() 
        var PerButtonDoc = document.getElementById("per_button_doc")
        PerButtonDoc.remove() 
     }else if(check === 3){
        this.setState({showbutton:"block"})
     }
}
//permission

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  componentDidMount(){
    GenerateDropDownStatus("Status")
  }
  
  dateTimePicker(){
    return <DatePicker onChange={(e) => {this.setState({date:e})}} dateFormat="DD/MM/YYYY"/>
  }

  getSelectionData(data){
    this.setState({selectiondata:data})
  }

  componentWillUnmount(){
    this.state = {}
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
    return <Button type="button" color="primary" style={{ background: "#26c6da", borderColor: "#26c6da" }}
      onClick={() => this.history.push('/doc/gi/manage?ID=' + data.ID)}>Detail</Button>
  }

  render(){
    const cols = [
      {Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center"},
      {accessor: 'Code', Header: 'Code',editable:false, Filter:"text"},
      {accessor: 'DesCustomerName', Header: 'Customer', editable:false, Filter:"text",},
      //{accessor: 'SouBranchName', Header: 'Branch',editable:false, Filter:"text"},
      {accessor: 'SouWarehouseName', Header: 'Warehouse', editable:false, Filter:"text",},
      //{accessor: 'SouAreaName', Header: 'Area', editable:false, Filter:"text",},
      // {accessor: 'ForCustomer', Header: 'For Customer', editable:false, Filter:"text",},
      // {accessor: 'Batch', Header: 'Batch', editable:false, Filter:"text",},
      // {accessor: 'Lot', Header: 'Lot', editable:false, Filter:"text",},
      {accessor: 'ActionTime', Header: 'Action Time', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      {accessor: 'DocumentDate', Header: 'Document Date', editable:false, Type:"datetime", dateformat:"date",filterable:false},
      {accessor: 'EventStatus', Header: 'Event Status', editable:false ,Filter:"dropdown", Type:"DocumentEvent"},
      //{accessor: 'RefID', Header: 'RefID', editable:false,},
      {accessor: 'Created', Header: 'CreateBy', editable:false, filterable:false},
      //{accessor: 'Modified', Header: 'ModifyBy', editable:false, filterable:false},
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

          <Button id="per_button_doc" style={{ background: "#66bb6a", borderColor: "#66bb6a", width: '130px',display:this.state.showbutton }}color="primary" className="float-right" onClick={() => this.props.history.push('/doc/gi/manage')}>Create Document</Button>
          
          <Button id="per_button_export" style={{ background: "#26c6da", borderColor: "#26c6da", width: '130px',display:this.state.showbutton }} color="primary" className="float-right" onClick={() => {
            let data1 = {"exportName":"DocumentIssuedToShop","whereValues":[this.state.date.format('YYYY-MM-DD')]}
            let data2 = {"exportName":"DocumentIssuedToCD","whereValues":[this.state.date.format('YYYY-MM-DD')]}
            axois.post(window.apipath + "/api/report/export/fileServer", data1).then(res => {
              if(res.data._result.status === 1){
                let resultPath = res.data.fileExport
                axois.post(window.apipath + "/api/report/export/fileServer", data2).then(res2 => {
                  window.success(resultPath + "<br/>" + res2.data.fileExport)
                })
              }
            })
          }}>Export Data</Button>
          <div id="per_button_date" className="float-right" style={{display:this.state.showbutton}}>{this.dateTimePicker()}</div>
        </div>
        <TableGen column={cols} data={this.state.select} addbtn={true} filterable={true}
        dropdownfilter = {this.state.statuslist} getselection={this.getSelectionData} addbtn={false}
        btn={btnfunc} defaultCondition={[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002},{ 'f': 'status', c:'!=', 'v': 2},{ 'f': 'EventStatus', c:'!=', 'v': 32}]}
        accept={false}/>
        <Card>
          <CardBody>
            <Button id="per_button_reject" style={{ background: "#ef5350", borderColor: "#ef5350", width: '130px', display:this.state.showbutton }} onClick={() => this.workingData(this.state.selectiondata, "reject")} color="danger" className="float-right">Reject</Button>
            <Button id="per_button_working" style={{ background: "#26c6da", borderColor: "#26c6da", width: '130px', display:this.state.showbutton }} onClick={() => this.workingData(this.state.selectiondata, "accept")} color="primary" className="float-right">Working</Button>
            {this.state.resp}
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default IssuedDoc;
