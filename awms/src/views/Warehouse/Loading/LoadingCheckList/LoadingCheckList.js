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
import {GetPermission,Nodisplay} from '../../../ComponentCore/Permission';

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
      this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
  }
  async componentWillMount(){
    //permission
    this.setState({showbutton:"none"})
    let data = await GetPermission()
    Nodisplay(data,33,this.props.history)
    this.displayButtonByPermission(data)
    //permission
  }
  //permission
  displayButtonByPermission(perID){
    this.setState({perID:perID})
    let check = false
    perID.forEach(row => {
        if(row === 33){
          check = true
        }else if(row === 34){
          check = false
        }
      })
        if(check === true){  
            var PerButtonInput = document.getElementById("per_button_input")
            PerButtonInput.remove()     
            var PerButtonScan = document.getElementById("per_button_scan")
            PerButtonScan.remove()    
            var PerButtonCode = document.getElementById("transportCode")
            PerButtonCode.remove() 
            var PerButtonTable = document.getElementById("per_button_table")
            PerButtonTable.remove() 

        }else if(check === false){
            this.setState({showbutton:"block"})
        }else{
            this.props.history.push("/404")
        } 
  }
  //permission

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
      this.setState({consoCode:[]})
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
            <div style={{display:this.state.showbutton}}>
              <label id="per_button_input" style={{paddingRight:"10px"}}>Barcode : </label><Input id="transportCode" style={{width:'200px', display:"inline-block"}} type="text" value={this.state.consoCode} 
                  autoFocus
                  onChange={(e) => {
                    this.setState({consoCode:e.target.value})
                  }} 
                  onKeyPress={e => {
                    if(e.key === "Enter"){
                      this.onHandleScanConso()
                    }
                  }}/>
              <Button id="per_button_scan" onClick={this.onHandleScanConso} color="primary">Scan</Button>
            </div>
          </Col>
        </Row>

        <ReactTable NoDataComponent={() => <div style={{ textAlign: "center", height: "100px", color: "rgb(200,206,211)" }}>No row found</div>} columns={cols} minRows={5} data={this.state.data} sortable={false} style={{background:'white'}} filterable={false} />
      <div id="per_button_table" style={{display:this.state.showbutton}}>
        <ReactTable columns={cols} minRows={5} data={this.state.data} sortable={false} style={{background:'white'}} filterable={false}
            showPagination={false}/> 
        </div>
        </div>
 
    )
  }
}

export default LoadingDocument;
