import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../TableSetup';
//import Axios from 'axios';
import {apicall} from '../../ComponentCore'

const Axios = new apicall()

class Supplier extends Component{
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
      select:{queryString:window.apipath + "/api/mst",
      t:"Supplier",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
      f:"ID,Code,Name,Description,Status,CreateBy,CreateTime,ModifyBy,ModifyTime",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:"",
      l:100,
      all:"",},
      sortstatus:0,
      selectiondata:[],
    };
    this.onHandleClickLoad = this.onHandleClickLoad.bind(this);
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this); 
    this.uneditcolumn = ["CreateBy","CreateTime","ModifyBy","ModifyTime"]
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  componentWillUnmount(){
  }

  onHandleClickLoad(event){
    Axios.post(window.apipath + "/api/mst/TransferFileServer/SupplierMst",{})
    this.forceUpdate();
  }

  render(){
    const cols = [
      {accessor: 'Code', Header: 'Code', editable:false,Filter:"text", fixed: "left"},
      {accessor: 'Name', Header: 'Name', editable:false,Filter:"text", fixed: "left"},
      {accessor: 'Status', Header: 'Status', editable:false, Type:"checkbox" ,Filter:"dropdown"},
      /* {accessor: 'Revision', Header: 'Revision', editable:false}, */
      {accessor: 'CreateBy', Header: 'CreateBy', editable:false},
      {accessor: 'CreateTime', Header: 'CreateTime', editable:false},
      {accessor: 'ModifyBy', Header: 'ModifyBy', editable:false},
      {accessor: 'ModifyTime', Header: 'ModifyTime', editable:false},
      /* {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"}, */
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
     
      <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} 
      filterable={true}  btn={btnfunc} uneditcolumn={this.uneditcolumn}
      table="ams_Supplier"/>
      <Card>
        <CardBody style={{textAlign:'right'}}>
            <Button style ={{ background: "#ef5350", borderColor: "#ef5350", width: '150px' }} onClick={this.onHandleClickLoad} color="danger"className="mr-sm-1">Load ข้อมูล Supplier</Button>
        </CardBody>
      </Card>
      </div>
    )
  }
}

export default Supplier;
