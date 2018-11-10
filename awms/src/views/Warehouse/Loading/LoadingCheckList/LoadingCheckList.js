import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Button, Row, Col } from 'reactstrap';
import ReactTable from 'react-table';
import Axios from 'axios';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import {AutoSelect, apicall, createQueryString} from '../../ComponentCore';
import 'react-datepicker/dist/react-datepicker.css';
import _ from 'lodash'

const API = new apicall();

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
    this.documentselect = {queryString:window.apipath + "/api/viw",
      t:"Document",
      q:'[{ "f": "DocumentType_ID", "c":"=", "v": 1012},{ "f": "EventStatus", "c":"=", "v": 11},{ "f": "Status", "c":"=", "v": 1}]',
      f:"ID,concat(Code, ' : ', DesCustomerName) as Code,transport",
      g:"",
      s:"[{'f':'DesCustomerName','od':'asc'}]",
      sk:0,
      all:"",}
  }

  getTableData(){
    if(this.state.transportvalue !== undefined){
      API.get(window.apipath + "/api/wm/loading/conso?docID=" + this.state.transportvalue).then(res => {
        let groupdata = _.groupBy(res.data.datas, (e) => {return e.id})
        let groupdisplay = []
            let packname = []
            for(let row in groupdata){
              groupdata[row].forEach(grow => {
                packname.forEach((prow, index) => {
                  if(prow === grow.packName)
                    packname.splice(index, 1)
                })
                packname.push(grow.packName)
              })
              let result = groupdata[row][0]
              result.item = packname.join(",")
              groupdisplay.push(groupdata[row][0])
            }
        this.setState({data:groupdisplay})
      })
    }
  }

  componentDidMount(){
    API.get(createQueryString(this.documentselect)).then(res => {
      this.setState({auto_transport : res.data.datas}, () => {
        const auto_transport = []
        this.state.auto_transport.forEach(row => {
          auto_transport.push({value:row.ID, label:row.Code, transportID:row.transport})
        })
        this.setState({auto_transport})
      })
    })
    this.getTableData()
  }

  onHandleScanConso(){
    let data = {docID:this.state.transportvalue, scanCode:this.state.consoCode, _token:localStorage.getItem("Token")}
    API.post(window.apipath + "/api/wm/loading/conso" ,data).then(res => {
      this.getTableData()
    })
  }

  render(){
    const cols = [
      {accessor: 'code', Header: 'Code',editable:false,},
      {accessor: 'item', Header: 'Item',editable:false,},
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
          <div style={{display:"inline-block",width:"300px"}}><AutoSelect selectfirst={false} data={this.state.auto_transport} result={(e) => this.setState({"transportvalue":e.value, "transporttext":e.label, "TransportID":e.transportID}, () => {this.getTableData()})}/></div></Col>
        </Row>
        <Row>
          <Col><label style={{paddingRight:"10px"}}>Transport : </label><span>{this.state.TransportID}</span></Col>
        </Row>
        <Row>
          <Col>
            <Input id="transportCode" style={{width:'200px', display:"inline-block"}} type="text" value={this.state.consoCode} 
              autoFocus
              onChange={(e) => {
                this.setState({consoCode:e.target.value})
              }} 
              onKeyPress={e => {
                if(e.key === "Enter"){
                  this.onHandleScanConso()
                }
              }}/>
          <Button onClick={this.onHandleScanConso} color="primary">Scan</Button></Col>
        </Row>

        <ReactTable columns={cols} minRows={5} data={this.state.data} sortable={false} style={{background:'white'}} filterable={false}
            showPagination={false}/>
      </div>
    )
  }
}

export default LoadingDocument;
