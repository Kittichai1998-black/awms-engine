import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../TableSetup';
import Axios from 'axios';

class Dealer extends Component{
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
      t:"Customer",
      q:"[{ 'f': 'Status', c:'!=', 'v': 2}]",
      f:"*",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:"",
      l:20,
      all:"",},
      sortstatus:0,
      loaddata:false,
      updateflag:false,
    };
    this.onHandleClickLoad = this.onHandleClickLoad.bind(this);
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
  }

  onHandleClickCancel(event){
    this.forceUpdate();
  }

  onHandleClickLoad(event){
    Axios.post("https://localhost:44366/api/mst/TransferFileServer/DealerMst",{})
    this.forceUpdate();
  }

  render(){
    const cols = [
      {field: 'ID', header: 'ID', editable:false,}, 
      {field: 'Code', header: 'Code', editable:true,},
      {field: 'Name', header: 'Name', editable:true},
      {field: 'Description', header: 'Description', sortable:false},
      {field: 'Status', header: 'Status', editable:true, body:'checkbox'},
      {field: 'Revision', header: 'Revision', editable:false},
      {field: 'CreateBy', header: 'CreateBy', editable:false},
      {field: 'CreateTime', header: 'CreateTime', editable:false},
      {field: 'ModifyBy', header: 'ModifyBy', editable:false},
      {field: 'ModifyTime', header: 'ModifyTime', editable:false},
      {field: '', header: '', manage:['remove']},
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
      <TableGen column={cols} data={this.state.select} ddlfilter={this.state.dropdownfilter} addbtn={true}
      statuslist = {this.state.statuslist} table="ams_Customer"/>
      <Card>
        <CardBody style={{textAlign:'right'}}>
          <Button onClick={this.onHandleClickLoad} color="danger"className="mr-sm-1">Load ข้อมูล Supplier</Button>
        </CardBody>
      </Card>
      </div>
    )
  }
}

export default Dealer;
