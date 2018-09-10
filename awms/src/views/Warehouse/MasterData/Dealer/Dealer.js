import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../TableSetup';
import Axios from 'axios';

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
      {accessor: 'ID', Header: 'ID', Filter:"text", editable:false,}, 
      {accessor: 'Code', Header: 'Code', editable:true,Filter:"text",},
      {accessor: 'Name', Header: 'Name', editable:true,Filter:"text",},
      {accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",},
      {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown",},
      {accessor: 'CreateBy', Header: 'CreateBy', editable:false,filterable:false},
      {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      {accessor: 'ModifyBy', Header: 'ModifyBy', editable:false,filterable:false},
      {accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
      {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Barcode", btntext:"Barcode"},
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
      <TableGen column={cols} data={this.state.select} dropdownfilter={ddlfilter} 
      addbtn={true} filterable={true}
      table="ams_Customer"/>
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
