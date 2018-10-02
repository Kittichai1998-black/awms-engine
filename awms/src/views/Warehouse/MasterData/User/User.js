import React, { Component } from 'react';
import "react-table/react-table.css";
import {TableGen} from '../TableSetup';
import Axios from 'axios';

class User extends Component{
    constructor(props) {
        super(props);

        this.state={
            data:[],
            statuslist:[{
                'status' : [{'value':'*','label':'All'},{'value':'1','label':'Active'},{'value':'0','label':'Inactive'}],
                'header' : 'Status',
                'field' : 'Status',
                'mode' : 'check',
            }],
            acceptstatus : false,
            select:{queryString:window.apipath + "/api/mst",
            t:"User",
            q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
            f:"ID,Code,Name,Password,SoftPassword,EmailAddress,LineID,FacebookID,TelOffice,TelMobile,Status,CreateBy,CreateTime,ModifyBy,ModifyTime",
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
        this.uneditcolumn = ["CreateBy","CreateTime","ModifyBy","ModifyTime"]
    }

    onHandleClickCancel(event){
        this.forceUpdate();
        event.preventDefault();
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

    render(){
        const cols = [
            {accessor: 'Code', Header: 'Username', editable:true, filterable:true, Filter:"text", insertable:true},
            {accessor: 'Password', Header: 'Password', editable:true, filterable:false, Type:"password" },
            {accessor: 'Name', Header: 'Name', editable:true},
            {accessor: 'EmailAddress', Header: 'Email Address', editable:true},
            {accessor: 'LineID', Header: 'Line ID', editable:true},
            {accessor: 'FacebookID', Header: 'Facebook ID', editable:true},
            {accessor: 'TelOffice', Header: 'Office Tel.', editable:true},
            {accessor: 'TelMobile', Header: 'Mobile', editable:true},
            {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},
            {accessor: 'CreateBy', Header: 'CreateBy', editable:false,filterable:false},
            {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
            {accessor: 'ModifyBy', Header: 'ModifyBy', editable:false,filterable:false},
            {accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
            {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
          ]; 
        
        String.prototype.replaceAll = function(search, replace)
        {
            if (replace === undefined) {
                return this.toString();
            }
            return this.replace(new RegExp('[' + search + ']', 'g'), replace);
        };
        

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
                      filterable={true} accept={true} btn={btnfunc} uneditcolumn={this.uneditcolumn}
                      table="ams_User"/>
            </div>) 
    }
}

export default User;