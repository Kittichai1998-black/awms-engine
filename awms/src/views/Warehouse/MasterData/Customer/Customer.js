import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../TableSetup';
import {apicall} from '../../ComponentCore'

const Axios = new apicall()

class Customer extends Component{
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
      t:"CustomerMaster",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
      f:"ID,Code,Name,Description,Status,Created,Modified",
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
    this.uneditcolumn = ["Created","Modified"]
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }
  
  onHandleClickLoad(event){
    Axios.post(window.apipath + "/api/mst/TransferFileServer/CustomerMst",{})
    this.forceUpdate();
  }

  render(){
    const cols = [
      {accessor: 'Code', Header: 'Code', editable:false,Filter:"text",},
      {accessor: 'Name', Header: 'Name', editable:false,Filter:"text",},
      //{accessor: 'Description', Header: 'Description', sortable:false, editable:false, Filter:"text",},
      {accessor: 'Status', Header: 'Status', editable:false, Type:"checkbox" ,Filter:"dropdown", Filter:"dropdown",},
      {accessor: 'Created', Header: 'Create', editable:false,filterable:false},
      /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime", filterable:false}, */
      {accessor: 'Modified', Header: 'Modify', editable:false,filterable:false},
      //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime", filterable:false},
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
      <div className="clearfix">
        <Button onClick={this.onHandleClickLoad} color="danger" className="float-right">Load ข้อมูล Customer</Button>
      </div>
      <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} 
        filterable={true}  btn={btnfunc} uneditcolumn={this.uneditcolumn}
        table="ams_Customer"/> 
      </div>
    )
  }
}

export default Customer;
