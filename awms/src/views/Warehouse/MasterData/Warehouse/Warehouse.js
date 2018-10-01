import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../TableSetup';
import Axios from 'axios';

class Warehouse extends Component{
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
        select:{queryString:"https://localhost:44366/api/mst",
        t:"Warehouse",
        q:"[{ 'f': 'Status', c:'!=', 'v': 2}]",
        f:"*",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:"",
        l:20,
        all:"",},
        sortstatus:0,
        selectiondata:[],
      };
      this.onHandleClickLoad = this.onHandleClickLoad.bind(this);
      this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
      this.uneditcolumn = ["ObjCode","PackCode","ModifyBy","ModifyTime"]  
    }

    onHandleClickCancel(event){
        this.forceUpdate();
        event.preventDefault();
    }
    
    componentWillUnmount(){
        Axios.isCancel(true);
    }
    
    onHandleClickLoad(event){
        /* Axios.post("https://localhost:44366/api/mst/TransferFileServer/DealerMst",{}) */
        this.forceUpdate();
    }

    render(){
        const cols = [
            {accessor: 'ID', Header: 'ID', Filter:"text", editable:false,}, 
            {accessor: 'Code', Header: 'Code', editable:true,Filter:"text",},
            {accessor: 'Name', Header: 'Name', editable:true,Filter:"text",},
            {accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",},
            {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown",},
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
                            filterable={true} accept={true} btn={btnfunc}
                            table="ams_Warehouse"/>

                <Card>
                    <CardBody style={{textAlign:'right'}}>
                        <Button onClick={this.onHandleClickLoad} color="danger"className="mr-sm-1">Load ข้อมูล Dealer</Button>
                    </CardBody>
                </Card>
            </div>
        )
    }
}

export default Warehouse;