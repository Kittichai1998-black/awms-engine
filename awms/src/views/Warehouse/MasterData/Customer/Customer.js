import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../TableSetup';
import {apicall} from '../../ComponentCore'
import {GetPermission,Nodisplay} from '../../../ComponentCore/Permission';

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
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    this.uneditcolumn = ["Created","Modified"]
  }
  async componentWillMount(){
    //permission
    this.setState({showbutton:"none"})
    let data = await GetPermission()
    Nodisplay(data,5,this.props.history)
    this.displayButtonByPermission(data)
    //permission
  }
  //permission
displayButtonByPermission(perID){
  this.setState({perID:perID})
  let check = false
  perID.forEach(row => {
    if(row === 5){
      check = true
    }if(row === 6){
      check = false
    }if(row === 7){
      check = false
    }
    })
  if (check === true) {
    this.setState({ permissionView: false })
  } else if (check === false) {
    this.setState({ permissionView: true })
  }
  }
  //permission

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
      { accessor: 'Code', Header: 'Code', editable: true,Filter:"text", fixed: "left"},
      { accessor: 'Name', Header: 'Name', editable: true,Filter:"text", fixed: "left"},
      //{accessor: 'Description', Header: 'Description', sortable:false, editable:false, Filter:"text",},
      { accessor: 'Status', Header: 'Status', editable: true, Type:"checkbox" ,Filter:"dropdown", Filter:"dropdown",},
      { accessor: 'Created', Header: 'Create', editable: false,filterable:false},
      /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime", filterable:false}, */
      { accessor: 'Modified', Header: 'Modify', editable: false,filterable:false},
      //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime", filterable:false},
      { show: this.state.permissionView, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove" }
    ];
    const btnfunc = [{
      btntype:"Barcode",
      func:this.createBarcodeBtn
    }]
    const view = this.state.permissionView

    return(
      <div>
      {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
      */}
        {/*<div className="clearfix">
          <Button id="per_button_load" style={{ background: "#ef5350", borderColor: "#ef5350",display:this.state.showbutton }}
            onClick={this.onHandleClickLoad} color="danger" className="float-right">Load ข้อมูล Customer</Button>
      </div>*/}
        <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addbtn={view}
          filterable={true} btn={btnfunc} uneditcolumn={this.uneditcolumn} accept={view}
          table="ams_Customer"/> 
      </div>
    )
  }
}

export default Customer;
