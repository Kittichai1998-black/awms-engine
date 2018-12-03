import React, { Component } from 'react';
import "react-table/react-table.css";
import { Button} from 'reactstrap';
import { TableGen } from '../../MasterData/TableSetup';
//import Axios from 'axios';
import {apicall, DatePicker, GenerateDropDownStatus} from '../../ComponentCore'
import moment from 'moment';
import {GetPermission,Nodisplay} from '../../../ComponentCore/Permission';

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
        f: "ID,Code,SouBranchName,DesBranchName,Status,SouWarehouseName,DesWarehouseName,DesAreaName,Batch,Lot,DocumentDate,EventStatus,RefID,Created,ModifyBy,Ref1,Ref2",
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

  async componentWillMount(){
    //permission
    this.setState({showbutton:"none"})
    let data =await GetPermission()
    Nodisplay(data,21,this.props.history)
    this.displayButtonByPermission(data)
    //permission

  }

//permission
displayButtonByPermission(perID){

  this.setState({perID:perID})
  let check = false
 for(let i = 0;i < perID.length; i++){
   let data = perID[i]
   if(data === 20){
      check = false
      break
    }if(data === 21){
      check = true
    }
 }
       if(check === true){  
          var PerButtonExport = document.getElementById("per_button_export")
          PerButtonExport.remove()     
          var PerButtonDate = document.getElementById("per_button_date")
          PerButtonDate.remove()    
       }else if(check === false){
          this.setState({showbutton:"block"})
       }
  }
  //permission

  onHandleClickCancel(event) {
    this.forceUpdate();
    event.preventDefault();
  }

  getSelectionData(data) {
    this.setState({ selectiondata: data })
  }


  onClickToDesc(data) {
    return <Button style={{color:"white"}} type="button" color="info" onClick={() => this.history.push('/doc/gr/view?docID=' + data.ID)}>Detail</Button>
  }

  render() 
  {
    const cols = [
      {accessor: 'Code', Header: 'Code',editable:false, Filter:"text"},
      {accessor: 'DocumentDate', Header: 'Document Date', editable:false, Type:"datetime", dateformat:"date",filterable:""},
      {accessor: 'SouWarehouseName', Header: 'DestinationWarehouse', editable:false, Filter:"text",},
      {accessor: 'SouBranchName', Header: 'SourceBranch', editable:false, Filter:"text",},
      {accessor: 'DesWarehouseName', Header: 'SourceWarehouse', editable:false, Filter:"text",},
      {accessor: 'DesBranchName', Header: 'DestinationBranc', editable:false, Filter:"text",},
      {accessor: 'RefID', Header: 'MaterialDocNo', editable:false, Filter:"text",},
      {accessor: 'Ref1', Header: 'MaterialDocYears', editable:false, Filter:"text",},
      {accessor: 'Ref2', Header: 'MovementType', editable:false, Filter:"text",},
      {accessor: 'EventStatus', Header: 'Event Status', editable:false ,Filter:"dropdown", Type:"DocumentEvent"},
      {accessor: 'Created', Header: 'Created', editable:false, filterable:false},
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
        <div className="clearfix" style={{display:this.state.showbutton}} >
          <Button style={{ background: "#66bb6a", borderColor: "#66bb6a", width: '130px',display:this.state.showbutton }}color="primary" className="float-right" onClick={() => this.props.history.push('/doc/gr/manage')}>Create Document</Button>
        </div>

        <TableGen column={cols} data={this.state.select} addbtn={true} filterable={true}
        dropdownfilter = {this.state.statuslist} getselection={this.getSelectionData} addbtn={false}
        btn={btnfunc} defaultPageSize={100000} defaultCondition={[{ 'f': 'DocumentType_ID', c:'=', 'v': 1001}]}
        accept={false}/>    
      </div>
    )
  }
}

export default IssuedDoc;
