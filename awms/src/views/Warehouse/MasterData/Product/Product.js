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
        'status' : [{'value':'1','label':'Active'},{'value':'0','label':'Inactive'},{'value':'*','label':'All'}],
        'header' : 'Status',
        'field' : 'Status',
        'mode' : 'check',
      }],
      acceptstatus : false,
      select:{queryString:"https://localhost:44366/api/viw",
      t:"SKUMaster",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
      f:"ID,SKUMasterType_ID,SKUMasterType_Code,SKUMasterType_Name,UnitType_ID,UnitType_Code,UnitType_Name,UnitType_Description,Code,Name,Description,WeightKG,WidthM,LengthM,HeightM,Revision,Status,CreateBy,CreateTime,ModifyBy,ModifyTime",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      l:20,
      all:"",},
      sortstatus:0,
      selectiondata:[],
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.createQueryString = this.createQueryString.bind(this)
    this.getAutocompletee = this.getAutocomplete.bind(this)
    this.getSelectionData = this.getSelectionData.bind(this)
    this.uneditcolumn = ["SKUMasterType_Code","SKUMasterType_Name","UnitType_Code","UnitType_Name","UnitType_Description","ModifyBy","ModifyTime","CreateBy","CreateTime"]
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
    const unitselect = {queryString:"https://localhost:44366/api/mst",
      t:"UnitType",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
      f:"ID,Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      l:20,
      all:"",}

    const packselect = {queryString:"https://localhost:44366/api/mst",
      t:"SKUMasterType",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
      f:"ID,Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      l:20,
      all:"",}

    Axios.all([Axios.get(this.createQueryString(packselect)),Axios.get(this.createQueryString(unitselect))]).then(
      (Axios.spread((packresult, unitresult) => 
    {
      let ddl = this.state.autocomplete
      let packList = {}
      let unitList = {}
      packList["data"] = packresult.data.datas
      packList["field"] = "SKUMasterType_Code"
      packList["pair"] = "SKUMasterType_ID"
      packList["mode"] = "Dropdown"
      console.log(packList)
      unitList["data"] = unitresult.data.datas
      unitList["field"] = "UnitType_Code"
      unitList["pair"] = "UnitType_ID"
      unitList["mode"] = "Dropdown"

      ddl = ddl.concat(packList).concat(unitList)
      this.setState({autocomplete:ddl})
    })))
  }

  getSelectionData(data){
    this.setState({selectiondata:data}, () => console.log(this.state.selectiondata))
  }

  createBarcodeBtn(data){
    return <Button type="button" color="info">{<Link style={{ color: '#FFF', textDecorationLine :'none' }} 
      to={'/mst/sku/manage/barcode?barcodesize=4&barcode='+data.Code+'&Name='+data.Name}>Print</Link>}</Button>
  }

  render(){
    const cols = [
      {Header: '', Type:"selection", sortable:false, Filter:"select",},
      {accessor: 'ID', Header: 'SKU',Filter:"text", editable:true, datatype:"int",},
      {accessor: 'SKUMasterType_Code', Header: 'SKU Type',updateable:false, Filter:"text", Type:"autocomplete"},
      {accessor: 'Code', Header: 'Code', editable:true,Filter:"text",},
      {accessor: 'Name', Header: 'Name', editable:true,Filter:"text",},
      {accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true, },
      {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",},
      {accessor: 'WidthM', Header: 'WidthM', editable:true,Filter:"text", datatype:"int",},
      {accessor: 'LengthM', Header: 'LengthM', editable:true,Filter:"text", datatype:"int",},
      {accessor: 'HeightM', Header: 'HeightM', editable:true,Filter:"text", datatype:"int",},
      {accessor: 'WeightKG', Header: 'Weight', editable:true,Filter:"text", datatype:"int",},
      {accessor: 'UnitType_Code', Header: 'Unit Type',updateable:false,Filter:"text", Type:"autocomplete"},
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
         table="ams_SKUMaster"/>
      </div>
    )
  }
}

export default ListProduct;
