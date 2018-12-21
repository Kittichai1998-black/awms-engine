import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../TableSetup';
//import Axios from 'axios';
import {apicall} from '../../ComponentCore'
import {GetPermission,Nodisplay} from '../../../ComponentCore/Permission';


const Axios = new apicall()

class Config  extends Component{
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
      t:"Config",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
      f:"ID,Code,Name,Description,DataValue,DataStyle,Status,Created,Modified",
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

  componentDidMount(){
    document.title = "Config : AWMS";
  }
   
  render(){
    const cols = [
      {accessor: 'Code', Header: 'Code', editable:true,Filter:"text", fixed:"left", minWidth:220},
      { accessor: 'Name', Header: 'Name', editable: true, Filter: "text", fixed: "left", minWidth: 220},
      { accessor: 'Description', Header: 'Description', editable: true, sortable: false, Filter: "text"},
      { accessor: 'DataValue', Header: 'DataValue', editable: true, Filter: "text", minWidth: 160},
      { accessor: 'DataStyle', Header: 'DataStyle', editable: true, Filter: "text", minWidth: 70},
      //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},  
      { accessor: 'Created', Header: 'Create', filterable: false, minWidth: 80},
      { accessor: 'Modified', Header: 'Modify', filterable: false, minWidth: 80},
      { Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove", minWidth: 90},

     
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
        table="ams_Config"/>
      </div>
    )
  }
}

export default Config ;
