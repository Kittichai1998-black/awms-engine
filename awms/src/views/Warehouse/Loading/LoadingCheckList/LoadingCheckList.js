import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Button, Row, Col } from 'reactstrap';
import ReactTable from 'react-table';
import Axios from 'axios';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import {AutoSelect, apicall, Clone} from '../../ComponentCore';
import {EventStatus} from '../../Status'
import 'react-datepicker/dist/react-datepicker.css';
import ReactAutocomplete from 'react-autocomplete';
import Downshift from 'downshift'
import queryString from 'query-string'

const API = new apicall();

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

class LoadingDocument extends Component{
  constructor(props) {
    super(props);
    this.state = {
      data:[],
      inputstatus:true,
      pageID:null,
      addstatus:false,
      adddisplay:"inline-block",
      auto_transport:[],
      readonly:false,
      transportselect:{queryString:window.apipath + "/api/tes",
        t:"Document",
        q:'[{ "f": "Status", "c":"=", "v": 1}]',
        f:"ID,Code, Name",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:0,
        all:"",},
    }
    this.onHandleScanConso = this.onHandleScanConso.bind(this)
    this.getTableData = this.getTableData.bind(this)
    this.documentselect = {queryString:window.apipath + "/api/trx",
      t:"Document",
      q:'[{ "f": "DocumentType_ID", "c":"=", "v": 1012},{ "f": "EventStatus", "c":"=", "v": 11},{ "f": "Status", "c":"=", "v": 1}]',
      f:"ID,Code,Transport_ID",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}
  }

  componentDidUpdate(){
    this.getTableData()
  }

  getTableData(){
    if(this.state.transportvalue !== undefined){
      API.get(window.apipath + "/api/wm/loading/conso?docID=" + this.state.transportvalue).then(res => {
        console.log(res)
        this.setState({data:res.data.datas})
      })
    }
  }

  componentDidMount(){
    API.get(createQueryString(this.documentselect)).then(res => {
      this.setState({auto_transport : res.data.datas}, () => {
        const auto_transport = []
        this.state.auto_transport.forEach(row => {
          auto_transport.push({value:row.ID, label:row.Code, transportID:row.Transport_ID})
        })
        this.setState({auto_transport})
      })
    })
  }

  onHandleScanConso(){
    let data = [{loadingDocID:this.state.transportvalue, scanCode:this.state.consoCode}]
    API.post(window.apipath + "/api/wm/loading/conso").then(res => {
    })
  }

  render(){
    const cols = [
      {accessor: 'code', Header: 'Code',editable:false,},
      {accessor: 'SKU', Header: 'SKU',editable:false},
      {accessor: 'docItemID', Header: 'Issued Document',editable:false,},
      {accessor: 'isLoaded', Header: 'Loaded',editable:false, Cell:e => <span>{e.value === true ? "Loaded" : "Wait"}</span>},
    ];

    return(
      <div>
      {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
        addbtn = เปิดปิดปุ่ม Add
        accept = สถานะของในการสั่ง update หรือ insert 
    
      */}
        <Row>
          <Col><label style={{paddingRight:"10px"}}>Loading Document : </label>
          <div style={{display:"inline-block",width:"300px"}}><AutoSelect data={this.state.auto_transport} result={(e) => this.setState({"transportvalue":e.value, "transporttext":e.label, "TransportID":e.TransportID})}/></div></Col>
        </Row>
        <Row>
          <Col><label style={{paddingRight:"10px"}}>Transport : </label><span>{this.state.TransportID}</span></Col>
        </Row>
        <Row>
          <Col><Input style={{width:'200px', display:"inline-block"}} type="text" value={this.state.consoCode} onChange={(e) => {this.setState({consoCode:e.target.value})}}/><Button>Scan</Button></Col>
        </Row>
        <ReactTable columns={cols} minRows={5} data={this.state.data} sortable={false} style={{background:'white'}} filterable={false}
            showPagination={false}/>
      </div>
    )
  }
}

export default LoadingDocument;