import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../TableSetup';
import Axios from '../../../../../node_modules/axios';

class Area extends Component{
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
      }],
      acceptstatus : false,
      select:{queryString:"https://localhost:44366/api/viw",
      t:"AreaMaster",
      q:"[{ 'f': 'Status', c:'!=', 'v': 2}]",
      f:"ID,Code,Name,Description,Warehouse_ID,Warehouse_Code,Warehouse_Name,Warehouse_Description,AreaMasterType_ID,AreaMasterType_Code,AreaMasterType_Name,AreaMasterType_Description,Status,CreateBy,CreateTime,ModifyBy,ModifyTime",
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
    this.filterList = this.filterList.bind(this)
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

  filterList(){
    const whselect = {queryString:"https://localhost:44366/api/mst",
      t:"Warehouse",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}",
      f:"ID,Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      l:20,
      all:"",}

    Axios.all([Axios.get(this.createQueryString(whselect))]).then(
      (Axios.spread((whresult) => 
    {
      let ddl = [...this.state.autocomplete]
      let whList = {}
      whList["data"] = whresult.data.datas
      whList["field"] = "Warehouse_code"
      whList["pair"] = "Warehouse_ID"
      whList["mode"] = "Dropdown"

      ddl = ddl.concat(whList)
      this.setState({autocomplete:ddl})
    })))
  }

  render(){
    const cols = [
      {accessor: 'ID', Header: 'ID', editable:false,}, 
      {accessor: 'Code', Header: 'Code', editable:true,},
      {accessor: 'Name', Header: 'Name', editable:true},
      {accessor: 'Description', Header: 'Description', sortable:false},
      {accessor: 'Warehouse_code', Header: 'Warehouse',updateable:false,Filter:"text", Type:"autocomplete"},
      {accessor: 'AreaMasterType_ID', Header: 'AreaMasterType_ID', sortable:false},
      {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown",},
      {accessor: 'CreateBy', Header: 'CreateBy', editable:false},
      {accessor: 'CreateTime', Header: 'CreateTime', editable:false},
      {accessor: 'ModifyBy', Header: 'ModifyBy', editable:false},
      {accessor: 'ModifyTime', Header: 'ModifyTime', editable:false},
      {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
    ]; 
  
    const ddlfilter = [
    {
      'status' : [{'value':'0','label':'Inactive'},{'value':'1','label':'Active'},{'value':'*','label':'All'}],
      'header' : 'Status',
      'field' : 'Status',
    }];

    return(
      <div>
      {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
      */}
      <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addbtn={true}
      autocomplete={this.state.autocomplete} filterable={true}
        table="ams_Area"/>
      </div>
    )
  }
}

export default Area;