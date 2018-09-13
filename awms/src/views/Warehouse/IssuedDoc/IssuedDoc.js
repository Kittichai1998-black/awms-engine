import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../TableSetup';
import Axios from '../../../../../node_modules/axios';
import ReactTable from 'react-table'

class IssuedDoc extends Component{
  constructor(props) {
    super(props);

    this.state = {
      
    };
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  componentDidMount(){
    this.filterList();
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
    const objselect = {queryString:"https://localhost:44366/api/mst",
      t:"ObjectSize",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}",
      f:"ID as ObjectSize_ID,Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      l:20,
      all:"",}

    const packselect = {queryString:"https://localhost:44366/api/mst",
    t:"PackMasterType",
    q:"[{ 'f': 'Status', c:'<', 'v': 2}",
    f:"ID as PackType_ID,Code",
    g:"",
    s:"[{'f':'ID','od':'asc'}]",
    sk:0,
    l:20,
    all:"",}

    Axios.all([Axios.get(this.createQueryString(packselect)),Axios.get(this.createQueryString(objselect))]).then(
      (Axios.spread((packresult, objresult) => 
    {
      let ddl = [...this.state.dropdownfilter]
      let packList = {}
      let objList = {}
      packList["data"] = packresult.data.datas
      packList["field"] = "PackCode"
      packList["header"] = "PackCode"
      packList["mode"] = "Dropdown"
      
      objList["data"] = objresult.data.datas
      objList["field"] = "ObjCode"
      objList["header"] = "ObjCode"
      objList["mode"] = "Dropdown"

      ddl = ddl.concat(packList).concat(objList)
      this.setState({dropdownfilter:ddl})
    })))
  }

  render(){
    const cols = [
      {field: 'SKU_ID', header: 'SKU'},
      {field: 'PackCode', header: 'PackType', body:'dropdown',updateable:false},
      {field: 'Code', header: 'Code', editable:true,},
      {field: 'Name', header: 'Name', editable:true},
      {field: 'Description', header: 'Description', sortable:false},
      {field: 'Status', header: 'Status', editable:true, body:'checkbox'},
      {field: 'WidthM', header: 'WidthM', editable:true},
      {field: 'LengthM', header: 'LengthM', editable:true},
      {field: 'HeightM', header: 'HeightM', editable:true},
      {field: 'WeightKG', header: 'Weight', editable:true},
      {field: 'ItemQty', header: 'ItemQty', editable:true},
      {field: 'ObjCode', header: 'Object', body:'dropdown',updateable:false},
      {field: 'Revision', header: 'Revision', editable:false},
      {field: 'CreateBy', header: 'CreateBy', editable:false,updateable:false},
      {field: 'CreateTime', header: 'CreateBy', editable:true,updateable:false, body:"datetime"},
      {field: 'ModifyBy', header: 'ModifyBy', editable:false,updateable:false},
      {field: 'ModifyTime', header: 'ModifyTime', editable:false,updateable:false, body:"datetime"},
      {field: 'QR Code', header: 'QR Code', editable:false,updateable:false},
      {field: '', header: '', manage:['barcode','remove']},
    ];

    const ddlfilter = [{
      'status' : [{'value':'0','label':'Code'},{'value':'1','label':'Name'},{'value':'2','label':'Description'},{'value':'null','label':'All'}],
      'header' : 'Table',
      'field' : '',
    },
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
        addbtn = เปิดปิดปุ่ม Add
        accept = สถานะของในการสั่ง update หรือ insert 
    
      */}
        <TableGen column={cols} data={this.state.select} ddlfilter={this.state.dropdownfilter} addbtn={true}
        statuslist = {this.state.statuslist} table="ams_PackMaster"/>
      </div>
    )
  }
}

export default IssuedDoc;
