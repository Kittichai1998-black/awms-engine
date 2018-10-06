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
          'status' : [{'value':'*','label':'All'},{'value':'1','label':'Active'},{'value':'0','label':'Inactive'}],
          'header' : 'Status',
          'field' : 'Status',
          'mode' : 'check',
        }],
        acceptstatus : false,
        select:{queryString:window.apipath + "/api/mst",
        t:"Warehouse",
        q:"[{ 'f': 'Status', c:'!=', 'v': 2}]",
        f:"ID,Code,Name,Description,Status,CreateBy,CreateTime,ModifyBy,ModifyTime",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:"",
        l:20,
        all:"",},
        sortstatus:0,
        selectiondata:[],
      };
      this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
      /* this.createQueryString = this.createQueryString.bind(this)
      this.filterList = this.filterList.bind(this) */
      this.uneditcolumn = ["CreateBy","CreateTime","ModifyBy","ModifyTime"]  
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
        const whselect = {queryString:window.apipath + "/api/mst",
          t:"Branch",
          q:"[{ 'f': 'Status', c:'<', 'v': 2}",
          f:"ID,Code",
          g:"",
          s:"[{'f':'ID','od':'asc'}]",
          sk:0,
          l:20,
          all:"",}
    
        const areatypeselect = {queryString:window.apipath + "/api/mst",
          t:"AreaMasterType",
          q:"[{ 'f': 'Status', c:'<', 'v': 2}",
          f:"ID,Code",
          g:"",
          s:"[{'f':'ID','od':'asc'}]",
          sk:0,
          l:20,
          all:"",}
          /* Axios.all([Axios.get(this.createQueryString(whselect)),Axios.get(this.createQueryString(areatypeselect))]).then(
            (Axios.spread((whresult, areatyperesult) =>  */
        Axios.all([Axios.get(this.createQueryString(whselect))]).then(
          (Axios.spread((whresult) => 
        {
          let ddl = [...this.state.autocomplete]
          let whList = {}
          let areatypelist = {}
          whList["data"] = whresult.data.datas
          whList["field"] = "Branch_Code"
          whList["pair"] = "Branch_ID"
          whList["mode"] = "Dropdown"
    
          /* areatypelist["data"] = areatyperesult.data.datas
          areatypelist["field"] = "AreaMasterType_Code"
          areatypelist["pair"] = "AreaMasterType_ID"
          areatypelist["mode"] = "Dropdown" */
    
          ddl = ddl.concat(whList)
          this.setState({autocomplete:ddl})
        })))
      }

    render(){
        const cols = [
            {accessor: 'Code', Header: 'Code', editable:true,Filter:"text",},
            {accessor: 'Name', Header: 'Name', editable:true,Filter:"text",},
            {accessor: 'Description', Header: 'Description',editable:true, sortable:false,Filter:"text",},
            /* {accessor: 'Branch_Code', Header: 'Branch',updateable:false,Filter:"text", Type:"autocomplete"}, */
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
                            filterable={true} autocomplete={this.state.autocomplete} accept={true} 
                            btn={btnfunc} uneditcolumn={this.uneditcolumn}
                            table="ams_Warehouse"/>

            </div>
        )
    }
}

export default Warehouse;