import React, { Component } from 'react';
import "react-table/react-table.css";
import {TableGen} from '../TableSetup';

class Branch extends Component{
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
        t:"BranchMaster",
        q:"[{ 'f': 'Status', c:'!=', 'v': 2}]",
        f:"ID,Code,Name,Description,Status,Created,Modified",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:0,
        l:100,
        all:"",},
        sortstatus:0,
        selectiondata:[],
      };
      this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
      this.uneditcolumn = ["Created","Modified"]
    }
  
    onHandleClickCancel(event){
        this.forceUpdate();
        event.preventDefault();
    }

    componentWillUnmount(){
    }

    render(){
        const cols = [ 
          {accessor: 'Code', Header: 'Code', editable:true,Filter:"text",},
          {accessor: 'Name', Header: 'Name', editable:true,Filter:"text",},
          //{accessor: 'Description', Header: 'Description', editable:true,Filter:"text",},
          {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},
          {accessor: 'Created', Header: 'Create', editable:false,filterable:false},
          /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
          {accessor: 'Modified', Header: 'Modify', editable:false,filterable:false},
          //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
          {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
        ];
        const btnfunc = [{
          history:this.props.history,
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
            filterable={true} accept={true} btn={btnfunc} uneditcolumn={this.uneditcolumn}
          table="ams_Branch"/>
          </div>
        )
    }
}  

export default Branch;