import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../TableSetup';
import Axios from 'axios';
import guid from 'guid';
import hash from 'hash.js';

class User extends Component{
    constructor(props) {
        super(props);

        this.state={
            data:[],
            statuslist:[{
                'status' : [{'value':'1','label':'Active'},{'value':'0','label':'Inactive'},{'value':'*','label':'All'}],
                'header' : 'Status',
                'field' : 'Status',
                'mode' : 'check',
            }],
            acceptstatus : false,
            select:{queryString:"https://localhost:44366/api/mst",
            t:"User",
            q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
            f:"ID,Code,Name,Password,SoftPassword,EmailAddress,LineID,FacebookID,TelOffice,TelMobile,Status,CreateBy,CreateTime,ModifyBy,ModifyTime",
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
        //this.filterList = this.filterList.bind(this)
        this.uneditcolumn = []
    }
    onHandleClickCancel(event){
        this.forceUpdate();
        event.preventDefault();
    }
    
    /* componentWillMount(){
    //this.filterList();
    } */

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

    hash256password() {
        var guid1 = guid.raw().toUpperCase()
        return guid1;
    }

    render(){
        const cols = [
            {accessor: 'ID', Header: 'ID', editable:false}, 
            {accessor: 'Code', Header: 'Code', editable:false,Filter:"text"},
            {accessor: 'Name', Header: 'Name', editable:true},
            {accessor: 'Password', Header: 'Password', sortable:false, editable:true,filter:false,Type:"password" },
            {accessor: 'EmailAddress', Header: 'Email Address', editable:true},
            {accessor: 'LineID', Header: 'Line ID', editable:true},
            {accessor: 'FacebookID', Header: 'Facebook ID', editable:true},
            {accessor: 'TelOffice', Header: 'Tel Office', editable:true},
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
        var str = this.hash256password().replaceAll('-','').toUpperCase();
        var testst = hash.sha256().update('pass').digest('hex').toUpperCase()
        var hashabc = hash.sha256().update('abc').digest('hex').toUpperCase()

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
         
            {'guid:  '+str}<br />
            {'hash256 of guid: '+testst}<br />
            {'hash256 of abc: '+hashabc}<br />
            DDD2CE1CF716F6613F637208D6A2C1B5213D9DBB3416851430F5E052C44ACF28<br />
            3B57C7547673D33C89BECFE19FCD3163<br />
        049984508E397F42106531E2C08FA315
            </div>) 
    }
}

export default User;