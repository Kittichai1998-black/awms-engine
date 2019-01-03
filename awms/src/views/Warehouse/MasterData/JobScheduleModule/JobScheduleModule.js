import React, { Component } from 'react';
import "react-table/react-table.css";
import {TableGen} from '../TableSetup';
import Axios from 'axios';
import {apicall, createQueryString} from '../../ComponentCore'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';
const api = new apicall()

class JobScheduleModule extends Component{
  constructor(props) {
    super(props);

    this.state = {
      data : [],
      autocomplete:[],
      statuslist:[{
      'status' : [{'value':'*','label':'All'},{'value':'1','label':'Active'},{'value':'0','label':'Inactive'}],
      'header' : 'Status',
      'field' : 'Status',
      'mode' : 'check',
      }],
      acceptstatus : false,
      select:{queryString:window.apipath + "/api/viw",
      t:"JobScheduleModule",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
      f:"ID,JobScheduleH_ID,JobScheduleH_Code,APIService_ID,APIService_Code,Seq,Code,Name,Description,FailBreakFlag,Status,Created,Modified",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:100,
      all:"",},
      sortstatus:0,        
     
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.filterList = this.filterList.bind(this)
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    this.uneditcolumn = ["JobScheduleH_Code","APIService_Code","Created","Modified"]
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }
  componentDidMount(){
    document.title = "Job Schedule Module : AWMS";
  }
  async componentWillMount(){
    this.filterList();
    let dataGetPer = await GetPermission()
    CheckWebPermission("JobScheduleModule", dataGetPer, this.props.history);
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
  componentWillUnmount(){
    Axios.isCancel(true);
  }

  filterList(){
    const JobScheduleselect = {queryString:window.apipath + "/api/mst",
      t:"JobSchedule",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}",
      f:"ID,concat(Code,' : ',Name) as Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}

    const APIServiceselect = {queryString:window.apipath + "/api/mst",
      t:"APIService",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}",
      f:"ID,concat(Code,' : ',Name) as Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}

    Axios.all([api.get(createQueryString(JobScheduleselect)),api.get(createQueryString(APIServiceselect))]).then(
      (Axios.spread((JobScheduleresult, APIServiceresult) => 
    {
      let ddl = [...this.state.autocomplete]
      let JobScheduleList = {}
      let APIServiceList = {}
      JobScheduleList["data"] = JobScheduleresult.data.datas
      JobScheduleList["field"] = "JobScheduleH_Code"
      JobScheduleList["pair"] = "JobScheduleH_ID"
      JobScheduleList["mode"] = "Dropdown"

      APIServiceList["data"] = APIServiceresult.data.datas
      APIServiceList["field"] = "APIService_Code"
      APIServiceList["pair"] = "APIService_ID"
      APIServiceList["mode"] = "Dropdown"

      ddl = ddl.concat(JobScheduleList).concat(APIServiceList)
      this.setState({autocomplete:ddl})
    })))
  }

  render(){
        const view = this.state.permissionView
        const cols = [
      {accessor: 'Code', Header: 'Code', editable:view,Filter:"text", fixed: "left"},
      {accessor: 'Name', Header: 'Name', editable:view,Filter:"text", fixed: "left"},
      //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true,},
      {accessor: 'Seq', Header: 'Seq', sortable:false,Filter:"text",editable:view,datatype:"int"},
      {accessor: 'FailBreakFlag', Header: 'FailBreakFlag', sortable:false,Filter:"text",editable:view,datatype:"int"},
      {accessor: 'JobScheduleH_Code', Header: 'Job Schedule',updateable:view,Filter:"text", Type:"autocomplete"},
      {accessor: 'APIService_Code', Header: 'API Service',updateable:view,Filter:"text", Type:"autocomplete"},
      //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown"},
      {accessor: 'Created', Header: 'Create', editable:false,filterable:false},
      /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
      {accessor: 'Modified', Header: 'Modify', editable:false,filterable:false},
      //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      {Show:view,Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
    ]; 
  
    const btnfunc = [{
      btntype:"Barcode",
      func:this.createBarcodeBtn
    }]

    return(
      <div>
      {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
      */}
        <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addExportbtn={view} expFilename={"JobScheduleModule"}
              filterable={true} autocomplete={this.state.autocomplete} accept={view} exportfilebtn={view} 
              btn={btnfunc} uneditcolumn={this.uneditcolumn}
        table="ams_JobScheduleModule"/>
      </div>
    )
  }
}

export default JobScheduleModule;
