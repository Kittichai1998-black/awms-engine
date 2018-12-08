import React, { Component } from 'react';
import "react-table/react-table.css";
import {TableGen} from '../TableSetup';
import Axios from 'axios';
import {createQueryString} from '../../ComponentCore'

class APIService extends Component{
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
      t:"APIService",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
      f:"ID,Code,Name,Description,ActionCommand,APIServiceGroup_ID,APIServiceGroup_Code,Permission_ID,Permission_Code,Status,Created,Modified",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:100,
      all:"",},
      sortstatus:0,        
     
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.filterList = this.filterList.bind(this)
    this.uneditcolumn = ["APIServiceGroup_Code","Permission_Code","Created","Modified"]
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  componentWillMount(){
    this.filterList();
  }
  
  componentWillUnmount(){
    Axios.isCancel(true);
  }

  filterList(){
    const Permissionselect = {queryString:window.apipath + "/api/mst",
      t:"Permission",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}",
      f:"ID,concat(Code,' : ',Name) as Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}

    const APIServiceGroupselect = {queryString:window.apipath + "/api/mst",
      t:"APIServiceGroup",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}",
      f:"ID,concat(Code,' : ',Name) as Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}

    Axios.all([Axios.get(createQueryString(Permissionselect)),Axios.get(createQueryString(APIServiceGroupselect))]).then(
      (Axios.spread((Permissionresult, APIServiceGroupresult) => 
    {
      let ddl = [...this.state.autocomplete]
      let PermissionList = {}
      let APIServiceGroupList = {}
      PermissionList["data"] = Permissionresult.data.datas
      PermissionList["field"] = "Permission_Code"
      PermissionList["pair"] = "Permission_ID"
      PermissionList["mode"] = "Dropdown"

      APIServiceGroupList["data"] = APIServiceGroupresult.data.datas
      APIServiceGroupList["field"] = "APIServiceGroup_Code"
      APIServiceGroupList["pair"] = "APIServiceGroup_ID"
      APIServiceGroupList["mode"] = "Dropdown"

      ddl = ddl.concat(PermissionList).concat(APIServiceGroupList)
      this.setState({autocomplete:ddl})
    })))
  }

  render(){
    const cols = [
      {accessor: 'Code', Header: 'Code', editable:true,Filter:"text", fixed: "left"},
      {accessor: 'Name', Header: 'Name', editable:true,Filter:"text", fixed: "left"},
      //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true,},
      {accessor: 'ActionCommand', Header: 'Action Command', sortable:false,Filter:"text",editable:true,},
      {accessor: 'Permission_Code', Header: 'Permission',updateable:false,Filter:"text", Type:"autocomplete"},
      {accessor: 'APIServiceGroup_Code', Header: 'API Service Group',updateable:false,Filter:"text", Type:"autocomplete"},
      //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown"},
      {accessor: 'Created', Header: 'Create', editable:false,filterable:false},
      /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
      {accessor: 'Modified', Header: 'Modify', editable:false,filterable:false},
      //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
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
      <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addbtn={true}
              filterable={true} autocomplete={this.state.autocomplete} accept={true}
              btn={btnfunc} uneditcolumn={this.uneditcolumn}
        table="ams_APIService"/>
      </div>
    )
  }
}

export default APIService;
