import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../TableSetup';
import Axios from 'axios';

class Supplier extends Component{
  constructor(props) {
    super(props);

    this.state = {
      data : [],
      acceptstatus : false,
      statuslist:[{
        'status' : [{'value':'0','label':'Inactive'},{'value':'1','label':'Active'},{'value':'*','label':'All'}],
        'header' : 'Status',
        'field' : 'Status',
        'mode' : 'check',
      }],
      select:{queryString:"https://localhost:44366/api/mst",
      t:"Supplier",
      q:"[{ 'f': 'Status', c:'!=', 'v': 2}]",
      f:"*",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:"",
      l:20,
      all:"",},
      sortstatus:0,
      selectiondata:[],
    };
    this.onHandleClickLoad = this.onHandleClickLoad.bind(this);
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this); 
  }

  onHandleClickCancel(event){
    this.forceUpdate();
  }

  onHandleClickLoad(event){
    Axios.post("https://localhost:44366/api/mst/TransferFileServer/SupplierMst",{})
    this.forceUpdate();
  }

  render(){
    const cols = [
      {accessor: 'ID', Header: 'ID', editable:false,}, 
      {accessor: 'Code', Header: 'Code', editable:true,},
      {accessor: 'Name', Header: 'Name', editable:true},
      {accessor: 'Description', Header: 'Description', sortable:false},
      {accessor: 'Status', Header: 'Status', editable:true, body:'checkbox'},
      {accessor: 'Revision', Header: 'Revision', editable:false},
      {accessor: 'CreateBy', Header: 'CreateBy', editable:false},
      {accessor: 'CreateTime', Header: 'CreateTime', editable:false},
      {accessor: 'ModifyBy', Header: 'ModifyBy', editable:false},
      {accessor: 'ModifyTime', Header: 'ModifyTime', editable:false},
      {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
    ];

    return(
      <div>
      {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
      */}
     
      <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addbtn={true}
      filterable={true} getselection={this.getSelectionData} accept={false}
      table="ams_Supplier"/>

      <Card>
        <CardBody style={{textAlign:'right'}}>
          <Button onClick={this.onHandleClickLoad} color="danger"className="mr-sm-1">Load ข้อมูล Supplier</Button>
        </CardBody>
      </Card>
      </div>
    )
  }
}

export default Supplier;
