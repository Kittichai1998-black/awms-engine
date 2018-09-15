import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../TableSetup';
import Axios from 'axios';

class AreaLocation extends Component{
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
        t:"AreaLocationMaster",
        q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
        f:"ID,AreaMaster_ID,AreaMaster_Code,AreaMaster_Name,AreaMaster_Description,Code,Name,Description,Gate,Bank,Bay,Level,ObjectSize_ID,ObjectSize_Code,ObjectSize_Name,ObjectSize_Description,Status,CreateBy,CreateTime,ModifyBy,ModifyTime",
        g:"",
        s:"[{'f':'Code','od':'asc'}]",
        sk:0,
        l:20,
        all:"",},
        sortstatus:0,
        selectiondata:[]
      };
      this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
      this.createQueryString = this.createQueryString.bind(this)
      this.filterList = this.filterList.bind(this)
      this.uneditcolumn = ["ObjCode","PackCode","ModifyBy","ModifyTime"]
    } 

    onHandleClickCancel(event){
        this.forceUpdate();
        event.preventDefault();
    }
    
    componentWillMount(){
    this.filterList();
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

    filterList(){
      const objselect = {queryString:"https://localhost:44366/api/mst",
        t:"ObjectSize",
        q:"[{ 'f': 'Status', c:'<', 'v': 2}",
        f:"ID,Code",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:0,
        l:20,
        all:"",}

      const areatypeselect = {queryString:"https://localhost:44366/api/mst",
        t:"AreaMasterType",
        q:"[{ 'f': 'Status', c:'<', 'v': 2}",
        f:"ID,Code",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:0,
        l:20,
        all:"",}
  
      Axios.all([Axios.get(this.createQueryString(objselect)),Axios.get(this.createQueryString(areatypeselect))]).then(
        (Axios.spread((objresult, areatyperesult) => 
      {
        let ddl = [...this.state.autocomplete]
        let objList = {}
        let areatypelist = {}
        objList["data"] = objresult.data.datas
        objList["field"] = "ObjectSize_Code"
        objList["pair"] = "ObjectSize_ID"
        objList["mode"] = "Dropdown"
  
        areatypelist["data"] = areatyperesult.data.datas
        areatypelist["field"] = "AreaMaster_Code"
        areatypelist["pair"] = "AreaMaster_ID"
        areatypelist["mode"] = "Dropdown"
  
        ddl = ddl.concat(objList).concat(areatypelist)
        this.setState({autocomplete:ddl})
      })))
    }

    render(){
        const cols = [
          {accessor: 'ID', Header: 'ID', editable:false}, 
          {accessor: 'AreaMaster_Code', Header: 'Area Master',updateable:false,Filter:"text", Type:"autocomplete"},
          {accessor: 'Code', Header: 'Code', editable:false},
          {accessor: 'Name', Header: 'Name', editable:true},
          {accessor: 'Description', Header: 'Description', sortable:false},
          {accessor: 'Gate', Header: 'Gate', editable:true},
          {accessor: 'Bank', Header: 'Bank', editable:true},
          {accessor: 'Bay', Header: 'Bay', editable:true},
          {accessor: 'Level', Header: 'Level', editable:true},
          {accessor: 'ObjectSize_Code', Header: 'Object Size',updateable:false,Filter:"text", Type:"autocomplete"},
          {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown"},
          {accessor: 'CreateBy', Header: 'CreateBy', editable:false,filterable:false},
          {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
          {accessor: 'ModifyBy', Header: 'ModifyBy', editable:false,filterable:false},
          {accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
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
          */}
          <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addbtn={true}
                  filterable={true} autocomplete={this.state.autocomplete} accept={true}
                  btn={btnfunc}
            table="ams_AreaLocation"/>
          </div>
        )
    }
}

export default AreaLocation;