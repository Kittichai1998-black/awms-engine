import React, { Component } from 'react';
import "react-table/react-table.css";
import {TableGen} from '../TableSetup';
import Axios from 'axios';
import {createQueryString} from '../../ComponentCore'

class AreaType extends Component{
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
        t:"AreaMasterType",
        q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
        f:"ID,Code,Name,Description,GroupType,Status,Created,Modified",
        g:"",
        s:"[{'f':'Code','od':'asc'}]",
        sk:0,
        l:100,
        all:"",},
        sortstatus:0,
        selectiondata: [],
        enumfield: ["GroupType"]     
       
      };
      this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
      this.filterList = this.filterList.bind(this)
      this.uneditcolumn = ["Created","Modified"]
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

  filterList() {
    const groupTypeSelect = { queryString: window.apipath + "/api/enum/AreaMasterGroupType" }
    const groupType = []
    Axios.all([Axios.get(createQueryString(groupTypeSelect))]).then(
      (Axios.spread((result) => {
        result.data.forEach(row => {
          groupType.push({ ID: row.value, Code: row.name })
        })
        
        let ddl = [...this.state.autocomplete]
        let groupTypeList = {}
        groupTypeList["data"] = groupType
        groupTypeList["field"] = "GroupType"
        groupTypeList["pair"] = "GroupType"
        groupTypeList["mode"] = "Dropdown"

        ddl = ddl.concat(groupTypeList)
        this.setState({ autocomplete: ddl })
      })))
    //    const whselect = {queryString:window.apipath + "/api/mst",
    //        t:"Warehouse",
    //        q:"[{ 'f': 'Status', c:'<', 'v': 2}",
    //        f:"ID,Code",
    //        g:"",
    //        s:"[{'f':'ID','od':'asc'}]",
    //        sk:0,
    //        all:"",}

    //    const areatypeselect = {queryString:window.apipath + "/api/mst",
    //        t:"AreaMasterType",
    //        q:"[{ 'f': 'Status', c:'<', 'v': 2}",
    //        f:"ID,Code",
    //        g:"",
    //        s:"[{'f':'ID','od':'asc'}]",
    //        sk:0,
    //        all:"",}

    //Axios.all([Axios.get(createQueryString(whselect)),Axios.get(createQueryString(areatypeselect))]).then(
    //    (Axios.spread((whresult, areatyperesult) => 
    //    {
    //        let ddl = [...this.state.autocomplete]
    //        let whList = {}
    //        let areatypelist = {}
    //        whList["data"] = whresult.data.datas
    //        whList["field"] = "Warehouse_Code"
    //        whList["pair"] = "Warehouse_ID"
    //        whList["mode"] = "Dropdown"

    //        areatypelist["data"] = areatyperesult.data.datas
    //        areatypelist["field"] = "AreaMasterType_Code"
    //        areatypelist["pair"] = "AreaMasterType_ID"
    //        areatypelist["mode"] = "Dropdown"

    //        ddl = ddl.concat(whList).concat(areatypelist)
    //        this.setState({autocomplete:ddl})
    //    })))
    }

    render(){
        const cols = [
            {accessor: 'Code', Header: 'Code', editable:true,Filter:"text", fixed: "left"},
            {accessor: 'Name', Header: 'Name', editable:true,Filter:"text", fixed: "left"},
          { accessor: 'GroupType', Header: 'Group Type', updateable: false, Filter: "text", Type: "autocomplete"},
            {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" , Filter:"dropdown"},
            
            //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true,},
            /* {accessor: 'Warehouse_Code', Header: 'Warehouse',updateable:false,Filter:"text", Type:"autocomplete"},
            {accessor: 'AreaMasterType_Code', Header: 'AreaMasterType',updateable:false,Filter:"text", Type:"autocomplete"},
            */
            {accessor: 'Created', Header: 'Create', editable:false,filterable:false}, 
            /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
            {accessor: 'Modified', Header: 'Modify', editable:false,filterable:false},
            //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
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
              btn={btnfunc} uneditcolumn={this.uneditcolumn} enumfield={this.state.enumfield}
                table="ams_AreaMasterType"/>
        </div>
        )
    }
}

export default AreaType;
