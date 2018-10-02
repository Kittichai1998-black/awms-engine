import React, { Component } from 'react';
import {Link}from 'react-router-dom';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../TableSetup';
import Axios from 'axios';

class Area extends Component{
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
            t:"BaseMaster",
            q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
            f:"ID,Code,Name,Description,BaseMasterType_ID,BaseMasterType_Code,BaseMasterType_Name,BaseMasterType_Description,ObjectSize_ID,ObjectSize_Code,ObjectSize_Name,ObjectSize_Description,Status,CreateBy,CreateTime,ModifyBy,ModifyTime",
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
        this.uneditcolumn = ["BaseMasterType_Code","BaseMasterType_Name","BaseMasterType_Description","ObjectSize_Code","ObjectSize_Name","ObjectSize_Description","ObjCode","PackCode","ModifyBy","ModifyTime"]
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

        const basetypeselect = {queryString:window.apipath + "/api/mst",
            t:"BaseMasterType",
            q:"[{ 'f': 'Status', c:'<', 'v': 2}",
            f:"ID,Code",
            g:"",
            s:"[{'f':'ID','od':'asc'}]",
            sk:0,
            l:20,
            all:"",}

    Axios.all([Axios.get(this.createQueryString(objselect)),Axios.get(this.createQueryString(basetypeselect))]).then(
        (Axios.spread((objresult, basetyperesult) => 
        {
            let ddl = [...this.state.autocomplete]
            let objList = {}
            let basetypelist = {}
            objList["data"] = objresult.data.datas
            objList["field"] = "ObjectSize_Code"
            objList["pair"] = "ObjectSize_ID"
            objList["mode"] = "Dropdown"

            basetypelist["data"] = basetyperesult.data.datas
            basetypelist["field"] = "BaseMasterType_Code"
            basetypelist["pair"] = "BaseMasterType_ID"
            basetypelist["mode"] = "Dropdown"

            ddl = ddl.concat(objList).concat(basetypelist)
            this.setState({autocomplete:ddl})
        })))
    }
    getSelectionData(data){
    this.setState({selectiondata:data}, () => console.log(this.state.selectiondata))
    }

    createBarcodeBtn(data){
        return <Button type="button" color="info"
        onClick={() => this.history.push('/mst/base/manage/barcode?barcodesize=4&barcode='+data.Code+'&Name='+data.Name)}>Print</Button>
      }

    render(){
        const cols = [
            {accessor: 'Code', Header: 'Code', editable:true},
            {accessor: 'Name', Header: 'Name', editable:true},
            {accessor: 'Description', Header: 'Description', sortable:false},
            {accessor: 'BaseMasterType_Code', Header: 'Base Type',updateable:false,Filter:"text", Type:"autocomplete"},
            {accessor: 'ObjectSize_Code', Header: 'Object Size',updateable:false,Filter:"text", Type:"autocomplete"},
            {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown"},
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
            filterable={true} autocomplete={this.state.autocomplete} getselection={this.getSelectionData} accept={true}
            btn={btnfunc} uneditcolumn={this.uneditcolumn}
             table="ams_BaseMaster"/>
          </div>
        )
      }
}
export default Area;