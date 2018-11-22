import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../TableSetup';
//import Axios from 'axios';
import {apicall} from '../../ComponentCore'
import {GetPermission,Nodisplay} from '../../../ComponentCore/Permission';


const Axios = new apicall()

class Feature  extends Component{
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
      t:"Feature",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
      f:"ID,Code,GroupName,Name,Description,DataValue,Status,Created,Modified",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:"",
      l:100,
      all:"",},
      sortstatus:0,
      selectiondata:[],
    };
    
    this.uneditcolumn = ["Created","Modified"]
  }

 
  //permission

  render(){
    const cols = [
      {accessor: 'Code', Header: 'Code', editable:true,Filter:"text", fixed:"left"},
      {accessor: 'Name', Header: 'Name', editable:true,Filter:"text", fixed:"left"},
      {accessor: 'GroupName', Header: 'GroupName', editable:true,Filter:"text", fixed:"left"},
      {accessor: 'Description', Header: 'Description',editable:true, sortable:false,Filter:"text",},
      {accessor: 'DataValue', Header: 'DataValue', editable:true,Filter:"text"},
      {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},  
      {accessor: 'Created', Header: 'Create',filterable:false},
      {accessor: 'Modified', Header: 'Modify',filterable:false},
      {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},

     
    ];
    const btnfunc = [{
      btntype:"Barcode",
      func:this.createBarcodeBtn
    }]
    //const view  = this.state.permissionView
    return(
      <div>
      {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
      */}
      <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addbtn={true}
              filterable={true}  accept={true} btn={btnfunc}
              uneditcolumn={this.uneditcolumn}
        table="ams_Feature"/>
      </div>
    )
  }
}

export default Feature ;
