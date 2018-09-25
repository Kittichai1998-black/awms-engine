import React, { Component } from 'react';
import {Link}from 'react-router-dom';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../TableSetup';
import Axios from 'axios';

class ListProduct extends Component{
  constructor(props) {
    super(props);

    this.state = {
      data : [],
      autocomplete:[],
      statuslist:[{
        'status' : [{'value':'0','label':'Inactive'},{'value':'1','label':'Active'},{'value':'*','label':'All'}],
        'header' : 'Status',
        'field' : 'Status',
        'mode' : 'check',
      }],
      acceptstatus : false,
      select:{queryString:window.apipath + "/api/viw",
      t:"PackMaster",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
      f:"ID,SKUMaster_ID,Code,PackMasterType_ID,Name,Description,WeightKG,WidthM,LengthM,HeightM,ItemQty,Revision,Status,ObjectSize_ID,CreateBy,CreateTime,ModifyBy,ModifyTime,ObjCode,PackCode",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:20,
      all:"",},
      sortstatus:0,
      selectiondata:[],
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.createQueryString = this.createQueryString.bind(this)
    this.getAutocomplete = this.getAutocomplete.bind(this)
    this.getSelectionData = this.getSelectionData.bind(this)
    this.uneditcolumn = ["ObjCode","PackCode","ModifyBy","ModifyTime","CreateBy","CreateTime"]
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  componentWillMount(){
    this.getAutocomplete();
  }

  componentWillUnmount(){
    Axios.isCancel(true);
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

  getAutocomplete(){
    const objselect = {queryString:window.apipath + "/api/mst",
      t:"ObjectSize",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
      f:"ID,Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      l:20,
      all:"",}

    const packselect = {queryString:window.apipath + "/api/mst",
      t:"PackMasterType",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
      f:"ID,Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      l:20,
      all:"",}

    Axios.all([Axios.get(this.createQueryString(packselect)),Axios.get(this.createQueryString(objselect))]).then(
      (Axios.spread((packresult, objresult) => 
    {
      let ddl = this.state.autocomplete
      let packList = {}
      let objList = {}
      packList["data"] = packresult.data.datas
      packList["field"] = "PackCode"
      packList["pair"] = "PackMasterType_ID"
      packList["mode"] = "Dropdown"
      
      objList["data"] = objresult.data.datas
      objList["field"] = "ObjCode"
      objList["pair"] = "ObjectSize_ID"
      objList["mode"] = "Dropdown"

      ddl = ddl.concat(packList).concat(objList)
      this.setState({autocomplete:ddl})
    })))
  }

  getSelectionData(data){
    this.setState({selectiondata:data}, () => console.log(this.state.selectiondata))
  }

  createBarcodeBtn(data){
    return <Button type="button" color="info">{<Link style={{ color: '#FFF', textDecorationLine :'none' }} 
      to={'/mst/sku/manage/barcode?barcode='+data.Code+'&Name='+data.Name}>Print</Link>}</Button>
  }

  render(){
    const cols = [
      {Header: '', Type:"selectrow", sortable:false, Filter:"select",},
      {accessor: 'SKUMaster_ID', Header: 'SKU',Filter:"text", editable:true, datatype:"int",},
      {accessor: 'PackCode', Header: 'PackType',updateable:false, Filter:"text", Type:"autocomplete"},
      {accessor: 'Code', Header: 'Code', editable:true,Filter:"text",},
      {accessor: 'Name', Header: 'Name', editable:true,Filter:"text",},
      {accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true, },
      {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",},
      {accessor: 'WidthM', Header: 'WidthM', editable:true,Filter:"text", datatype:"int",},
      {accessor: 'LengthM', Header: 'LengthM', editable:true,Filter:"text", datatype:"int",},
      {accessor: 'HeightM', Header: 'HeightM', editable:true,Filter:"text", datatype:"int",},
      {accessor: 'WeightKG', Header: 'Weight', editable:true,Filter:"text", datatype:"int",},
      {accessor: 'ItemQty', Header: 'ItemQty', editable:true,Filter:"text", datatype:"int",},
      {accessor: 'ObjCode', Header: 'Object',updateable:false,Filter:"text", Type:"autocomplete"},
      {accessor: 'Revision', Header: 'Revision', editable:false, datatype:"int",},
      {accessor: 'CreateBy', Header: 'CreateBy', editable:false,filterable:false},
      {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      {accessor: 'ModifyBy', Header: 'ModifyBy', editable:false,filterable:false},
      {accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Barcode", btntext:"Barcode"},
      {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
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
        addbtn = เปิดปิดปุ่ม Add
        accept = สถานะของในการสั่ง update หรือ insert
        autocomplete = data field ที่ต้องการทำ autocomplete
        filterable = เปิดปิดโหมด filter
        getselection = เก็บค่าที่เลือก
    
      */}
        <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addbtn={true}
        filterable={true} autocomplete={this.state.autocomplete} getselection={this.getSelectionData} accept={true}
        btn={btnfunc} uneditcolumn={this.uneditcolumn}
         table="ams_PackMaster"/>
      </div>
    )
  }
}

export default ListProduct;
