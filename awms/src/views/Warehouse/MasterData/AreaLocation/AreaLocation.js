import React, { Component } from 'react';
import {Link}from 'react-router-dom';
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
        'status' : [{'value':'*','label':'All'},{'value':'1','label':'Active'},{'value':'0','label':'Inactive'}],
        'header' : 'Status',
        'field' : 'Status',
        'mode' : 'check',
        }],
        acceptstatus : false,
        select:{queryString:window.apipath + "/api/viw",
        t:"AreaLocationMaster",
        q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
        f:"ID,AreaMaster_ID,AreaMaster_Code,AreaMaster_Name,AreaMaster_Description,Code,Name,Description,Gate,Bank,Bay,Level,ObjectSize_ID,ObjectSize_Code,ObjectSize_Name,ObjectSize_Description,Status,CreateBy,CreateTime,ModifyBy,ModifyTime",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:0,
        l:20,
        all:"",},
        sortstatus:0,
        selectiondata:[]
      };
      this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
      this.createQueryString = this.createQueryString.bind(this)
      this.filterList = this.filterList.bind(this)
      this.uneditcolumn = ["AreaMaster_Code","AreaMaster_Name","AreaMaster_Description","ObjectSize_Code","ObjectSize_Name","ObjectSize_Description","ModifyBy","ModifyTime","CreateBy","CreateTime"]
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
      const objselect = {queryString:window.apipath + "/api/mst",
        t:"ObjectSize",
        q:"[{ 'f': 'Status', c:'<', 'v': 2}",
        f:"ID,Code",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:0,
        l:20,
        all:"",}

      const areatypeselect = {queryString:window.apipath + "/api/mst",
        t:"AreaMaster",
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

    createBarcodeBtn(data){
      return <Button type="button" color="info"
      onClick={() => this.history.push('/mst/arealocation/manage/barcode?barcodesize=1&barcode='+data.Code+'&Name='+data.Name)}>Print</Button>
    }

    render(){
        const cols = [
          {accessor: 'Code', Header: 'Data', editable:false},
          {accessor: 'Code', Header: 'Code Edit', Type:"autogenloc", editable:false},
          {accessor: 'Name', Header: 'Name', editable:true},
          {accessor: 'Description', Header: 'Description', sortable:false, editable:true},
          {accessor: 'Gate', Header: 'Gate', editable:true},
          {accessor: 'Bank', Header: 'Bank', editable:true},
          {accessor: 'Bay', Header: 'Bay', editable:true},
          {accessor: 'Level', Header: 'Level', editable:true},
          {accessor: 'AreaMaster_Code', Header: 'Area Master',updateable:false,Filter:"text", Type:"autocomplete"},
          {accessor: 'ObjectSize_Code', Header: 'Object Size',updateable:false,Filter:"text", Type:"autocomplete"},
          {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},
          {accessor: 'CreateBy', Header: 'CreateBy', editable:false,filterable:false},
          {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
          {accessor: 'ModifyBy', Header: 'ModifyBy', editable:false,filterable:false},
          {accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
          {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Barcode", btntext:"Barcode"},
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
            addbtn = เปิดปิดปุ่ม Add
            accept = สถานะของในการสั่ง update หรือ insert
            autocomplete = data field ที่ต้องการทำ autocomplete
            filterable = เปิดปิดโหมด filter
            getselection = เก็บค่าที่เลือก
          */}
            <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addbtn={true}
                      filterable={true} autocomplete={this.state.autocomplete} accept={true}
                      btn={btnfunc} uneditcolumn={this.uneditcolumn}
                      table="ams_AreaLocationMaster"/>
          </div>
          
        )
    }
}

export default AreaLocation;